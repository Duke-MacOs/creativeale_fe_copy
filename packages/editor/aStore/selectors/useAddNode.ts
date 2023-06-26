import { selectNode, addNode, changeEditor, ISceneState, addFromNode } from '../project';
import { createAnimationNode, createModelNode, createNode, createParticle3DNode } from '@byted/riko';
import { useDispatch, useStore } from 'react-redux';
import { fromFiles } from '@editor/Resource/upload';
import { useProject } from './useProject';
import { absoluteUrl } from '@shared/utils';
import { useCallback } from 'react';
import { message } from 'antd';
import {
  findById,
  fromScene,
  getScene,
  getSceneByOrderId,
  intoScene,
  isAnimation,
  newID,
  openKeysToCompProps,
} from '../../utils';
import Axios from 'axios';
import { useParticle3D } from '@editor/Resource/entries/3d/Particle3D/hooks';
import { useSettings } from './useSettings';
import { omit } from 'lodash';
import { isNode3DMime, isResource3D } from '@shared/utils/resource';

type AddNodeData = {
  mime: string;
  name: string;
  url: string | number;
  position?: { x: number; y: number };
  targetId?: number;
  cover?: string;
  dropWhere?: 'inside' | 'after' | 'before';
  extra?: Record<string, any>;
  mapNode?: (node: RikoNode) => RikoNode;
  edit3d?: boolean;
};

const indexPosition = (
  scene: ISceneState,
  mime: string,
  targetId?: number,
  dropWhere?: AddNodeData['dropWhere'],
  edit3d = false
): [number, number] => {
  console.log('scene:', scene);
  if (targetId && dropWhere) {
    const [current, parent = scene] = findById(scene.nodes, targetId);
    if (!current) {
      return [scene.id, scene.nodes.length];
    }
    if (dropWhere === 'inside') {
      return [targetId, current.nodes.length];
    }
    return [parent.id, parent.nodes.findIndex(node => node.id === targetId) + Number(dropWhere === 'after')];
  }
  // 3D元素默认创建在3D场景下面
  if (edit3d && mime !== 'Scene3D' && isNode3DMime(mime) && scene.type === 'Scene') {
    const scene3D = scene.nodes.find(node => node.type === 'Scene3D');
    if (scene3D) {
      return [scene3D.id, 0];
    } else {
      throw new Error('缺少3D场景节点');
    }
  }

  const nodeIds = Object.keys(scene.editor.selected).map(Number);
  if (nodeIds.length) {
    const [node, parent = scene] = findById(scene.nodes, nodeIds[0]);
    if (node) {
      return [parent.id, Math.max(...nodeIds.map(id => parent.nodes.findIndex(node => node.id === id))) + 1];
    }
  }
  return [scene.id, scene.nodes.length];
};

const useGetTrail3DMaterialOrderId = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  return () => {
    return (
      getState().project.materials.find(mat => {
        return mat.material.type === 'TrailMaterial';
      })?.orderId ?? ''
    );
  };
};
export const useAddNodeWith3D = () => {
  const { getState } = useStore<EditorState, EditorAction>();
  return useCallback(
    async (mime: string, onAction: () => any): Promise<ReturnType<typeof onAction>> => {
      const type = getState().project.type;
      const {
        editor: { edit3d },
      } = getScene(getState().project);
      const scene3D = getScene(getState().project, undefined, false).nodes.find(node => node.type === 'Scene3D');
      if (type === 'Project' && edit3d && !scene3D && mime !== 'scene3D') {
        message.error('缺少3D场景，无法添加节点!');
        return;
      }
      if (type === 'Model' && mime !== 'Model') {
        message.error('编辑模型时，只允许添加模型');
        return;
      }
      if (type === 'Particle3D' && mime !== 'Particle3D') {
        message.error('编辑粒子时，只允许添加粒子');
        return;
      }
      return await Promise.resolve(onAction());
    },
    [getState]
  );
};

export const useAddNode = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const getTrail3DMaterialOrderId = useGetTrail3DMaterialOrderId();
  const { onParticleNodeToScene } = useParticle3D();
  return useCallback(
    async (
      { mime, name, url, position, targetId, cover, dropWhere, extra, mapNode, edit3d }: AddNodeData,
      loading = false
    ) => {
      console.log('!:', mime, name, url);
      const scene = getScene(getState().project);
      if (mime.startsWith('PV')) {
        const jumpComponents = ['PVButton', 'PVClickArea', 'PVSlider'];
        if (mime === 'PVAlphaVideo' || mime === 'PVGuider') {
          if (Object.values(scene.props).some(({ type }) => jumpComponents.includes(type))) {
            if (mime === 'PVAlphaVideo') {
              throw new Error('循环视频不能添加出框视频');
            }
          } else if (mime === 'PVGuider') {
            throw new Error('无跳转组件不能添加手势引导');
          }
          if (Object.values(scene.props).some(({ type }) => type === 'PVAlphaVideo')) {
            throw new Error('不能重复添加出框视频');
          }
        } else if (jumpComponents.includes(mime)) {
          if (Object.values(scene.props).some(({ type }) => type === 'PVAlphaVideo')) {
            throw new Error('出框视频场景不能添加跳转组件');
          }
        }
      }
      edit3d = edit3d ?? scene.editor.edit3d;
      const [parentId, index] = indexPosition(
        getScene(getState().project, undefined, false),
        mime,
        targetId,
        dropWhere,
        edit3d
      );
      if (loading) {
        dispatch(changeEditor(0, { loading: true }));
      }
      try {
        const getNodeAction = async () => {
          if (typeof url === 'string') {
            return addNode({ parentId, index, mime, name, url, endPos: position }, async node => {
              if (isAnimation(node.type) && node.props) {
                delete node.props.sceneData;
                const { data } = await Axios.get(absoluteUrl(url));
                node.editor = {
                  ...node.editor,
                  state: [{ name: '默认状态', id: -1, duration: data.props?.duration }, ...(data.editor?.state ?? [])],
                };
                if (!(node.props.compProps as any)?.length) {
                  const {
                    props: {
                      [data.id]: { compProps },
                    },
                  } = openKeysToCompProps(fromScene(data));
                  node.props.compProps = compProps;
                }
              }
              if (node.type === 'Particle3D') {
                const orderId = await onParticleNodeToScene(node);
                node.props!.url = orderId;
              }
              if (node.props?.url) {
                const _editor = { name } as any;
                Object.assign(_editor, { originWidth: node.props.width, originHeight: node.props.height });
                if (extra && typeof extra === 'object') {
                  const { size } = extra;
                  Object.assign(_editor, { size });
                }
                if (node.type === 'Particle') {
                  _editor.textureName = name;
                }
                if (cover) {
                  _editor.cover = cover;
                }
                (node.props as any)._editor = _editor;
              }
              return mapNode?.(node) ?? node;
            });
          }
          let node;
          if (mime === 'PanoramaSpace') {
            // 创建全景节点
            node = await createNode(name, mime, newID, url as any);
            return addFromNode(
              parentId,
              index,
              {
                ...node,
                editor: {
                  ...node.editor,
                },
              },
              undefined,
              position
            );
          } else {
            const component = getSceneByOrderId(getState().project, url);

            // 创建组件和模型
            node = await (component.type === 'Model'
              ? createModelNode
              : component.type === 'Particle3D'
              ? createParticle3DNode
              : createAnimationNode)(
              name,
              checkComponentCircleRef(getState().project, url),
              newID,
              intoScene(openKeysToCompProps(component), ['store', 'type'])
            );

            const blueprint = intoScene(component).scripts?.find(script => script.type === 'Blueprint');

            return addFromNode(
              parentId,
              index,
              {
                ...node,
                props: omit(node.props, 'sceneData'),
                editor: {
                  ...node.editor,
                  state: [
                    { name: '默认状态', id: -1, duration: component.props[component.id].duration },
                    ...(component.editor.state ?? []),
                  ],
                },
                scripts: [
                  ...(node.scripts || []),
                  blueprint && {
                    ...blueprint,
                    props: { ...blueprint.props, scripts: [], inputs: [] as any }, // 每次都清空了inputs
                    editor: { ...blueprint.editor, nodeType: 'node' },
                    id: newID(),
                  },
                ].filter(Boolean),
              },
              undefined,
              position
            );
          }
        };
        const nodeAction = await getNodeAction();
        dispatch(nodeAction);
        dispatch(selectNode([nodeAction.node.id]));
        return nodeAction.node.id;
      } catch (error) {
        message.error(error.message || error || `无法添加节点${name}`);
        throw error;
      } finally {
        if (loading) {
          dispatch(changeEditor(0, { loading: false }));
        }
      }
    },
    [dispatch, getState, getTrail3DMaterialOrderId]
  );
};

export const checkComponentCircleRef = (project: EditorState['project'], orderId: number | string): number | string => {
  if (['Project', 'PanoramaData'].includes(project.type) || typeof orderId !== 'number') {
    return orderId;
  }
  const current = project.scenes[0];
  const component = getSceneByOrderId(project, orderId);
  if (!component.sceneId || current.sceneId === component.sceneId) {
    throw new Error('当前组件不能添加自身作为节点，否则循环引用');
  }
  const findOrderId = ({ props }: ISceneState, orderId: number): boolean =>
    Object.values(props).some(
      ({ type, url }) =>
        type === 'Animation' &&
        typeof url === 'number' &&
        (url === orderId || findOrderId(getSceneByOrderId(project, url), orderId))
    );
  if (findOrderId(component, current.orderId)) {
    throw new Error(`当前组件不有添加“${component.name}”作为节点，否则循环引用`);
  }
  return orderId;
};

export const useOnAddNodeFromFiles = () => {
  const projectId = useProject('id');
  const onAddNode = useAddNode();
  const dispatch = useDispatch();
  const typeOfPlay = useSettings('typeOfPlay');
  return {
    onAddNode,
    onAddNodeFromFiles: useCallback(
      async (files: File[], options?: Pick<Parameters<typeof onAddNode>[0], 'position' | 'dropWhere' | 'targetId'>) => {
        if (typeOfPlay === 4 && files.some(file => file.type.startsWith('video'))) {
          throw new Error('每个场景只允许存在一个视频');
        }
        const withAccepted = await fromFiles(files, { projectId });
        if (withAccepted) {
          dispatch(changeEditor(0, { loading: true }));
          try {
            return withAccepted()
              .then(dataList =>
                Promise.all(
                  dataList.map(data =>
                    onAddNode({
                      ...data,
                      ...options,
                    })
                  )
                )
              )
              .then(() => true);
          } finally {
            dispatch(changeEditor(0, { loading: false }));
          }
        }
        return false;
      },
      [dispatch, onAddNode, projectId]
    ),
  };
};
