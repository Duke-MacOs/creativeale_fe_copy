import { ActionType, AddNodeAction, createNode, INodeData, IScriptData } from '@byted/riko';
import { fromNodes, mapResNode, newID } from '@editor/utils';
import { ICompProp, INodeState, ISceneState } from '../../types';
import { IDeleteAction, delNode } from './deleteById';
import { isString, mapValues } from 'lodash';
import { relativeUrl } from '@shared/utils';
import { putNode } from './utils';
import { updateBlueprintIds } from '@editor/Editor/Blueprint/utils/updateBlueprintScript';
import { uploadFile } from '@shared/api';

const ACTION = ActionType.AddNode;
export interface IAddNode extends AddNodeAction {
  undo?: IDeleteAction;
}
export const getNewNode = async (mime: string, name: string, urlOrText: string): Promise<AddNodeAction['node']> => {
  const typePropsFrom = () => {
    if (mime.startsWith('image/')) {
      return 'Sprite' as const;
    } else if (mime.startsWith('audio/')) {
      return 'Sound' as const;
    } else if (mime.startsWith('video/')) {
      return 'Video' as const;
    } else if (mime.startsWith('text/')) {
      return 'Text' as const;
    }
    return mime;
  };
  const node = await createNode(name, typePropsFrom() as any, newID, relativeUrl(urlOrText));
  if (node.type === 'Video') {
    const { props: { poster } = {} } = node;
    if (poster instanceof Blob) {
      try {
        const { downloadUrl: url } = await uploadFile(poster);
        if (url) {
          return {
            ...node,
            props: {
              ...node.props,
              poster: relativeUrl(url),
            },
          };
        }
      } catch {
        return node;
      }
    }
  }
  return node;
};
export const updateNodeId = (nodes: INodeData[] = []): typeof nodes =>
  nodes.map(node => {
    return {
      ...node,
      id: newID(),
      props: mapValues(node.props, (value, key) => {
        if (key !== 'compProps') {
          return value;
        }
        return (value as ICompProp[]).map(comp => ({
          ...comp,
          props: comp.props.map(prop =>
            prop.key.startsWith('$') && prop.value
              ? { ...prop, value: mapResNode(prop.value as any, node => ({ ...node, id: newID() })) }
              : prop
          ),
        }));
      }),
      scripts: updateScriptId(node.scripts),
      nodes: updateNodeId(node.nodes),
    };
  });

export const updateScriptId = (scripts: IScriptData[] = []): typeof scripts =>
  scripts.map(script => {
    return script.type === 'Blueprint'
      ? updateBlueprintIds(script).newScript
      : {
          ...script,
          id: newID(),
          props: mapValues(script.props, (value, key) => {
            if (key.startsWith('$')) {
              return mapResNode(value as any, node => ({ ...node, id: newID() }));
            }
            switch (key) {
              case 'id':
                return newID();
              case 'scripts':
                return updateScriptId(value as any);
              case 'elseScripts':
                return updateScriptId(value as any);
              default:
                return value;
            }
          }) as any,
        };
  });
const getPSDNode = async (url: string) => {
  const path = relativeUrl(url).split('/').slice(0, -1).join('/');
  const appendPath = (nodes: INodeData[]) => {
    nodes.forEach(node => {
      if (node.props?.url && isString(node.props.url)) {
        node.props.url = node.props.url.startsWith('https') ? relativeUrl(node.props.url) : `${path}/${node.props.url}`;
      }
      appendPath(node.nodes || []);
    });
    return nodes;
  };
  return fetch(url, {
    credentials: 'same-origin',
    mode: 'cors',
  })
    .then(res => res.json())
    .then(node => updateNodeId([node]))
    .then(nodes => appendPath(nodes)[0]);
};
export const addNode = async (
  {
    mime,
    url,
    name,
    ...others
  }: Omit<IAddNode, 'type' | 'node'> & {
    mime: string;
    name: string;
    url: string;
  },
  mapNode = (node: RikoNode) => Promise.resolve(node)
): Promise<IAddNode> => ({
  type: ACTION,
  node: await mapNode(mime === 'PSD' ? await getPSDNode(url) : await getNewNode(mime, name, url)),
  ...others,
});

export const addFromNode = (
  parentId: number,
  index: number,
  node: any,
  startPos?: { x: number; y: number },
  endPos?: { x: number; y: number }
): IAddNode =>
  ({
    type: ACTION,
    parentId,
    node,
    index,
    startPos,
    endPos,
  } as any);
export default (scene: ISceneState, action: IAddNode): ISceneState => {
  if (action.type === ACTION) {
    const props = { ...scene.props };
    const node = fromNodes([action.node as any], props, scene.editor)[0];
    const nodes = putNode(scene.id, scene.nodes, action.parentId, action.index, node as INodeState);
    if (nodes !== scene.nodes) {
      action.undo = delNode(action.node.id);
      return {
        ...scene,
        props,
        nodes,
      };
    }
  }
  return scene;
};
