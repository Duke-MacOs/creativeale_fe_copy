import { INodeData } from '@byted/riko';
import JSZip from 'jszip';
import { createMaterialByUrls } from '@shared/api/library';
import { toNodeState } from './convertNode';
import { IFigmaState, IFigmaNode, IFigmaParams } from '../types';
import { renderFigmaNode } from '../figmaApi';
import { ResourceType } from '../../accepted';

export function documentToDict(documentName: string, document: IFigmaNode) {
  const res: IFigmaState = {
    root: document.id,
    documentName,
    dict: {},
  };
  const collectNode = (res: IFigmaState, node: IFigmaNode) => {
    (node.children || []).forEach(child => {
      collectNode(res, child);
    });
    res.dict[node.id] = {
      ...node,
      children: node.children ? node.children.map(child => child.id) : undefined,
    };
  };
  collectNode(res, document);
  return res;
}

export function pickFrames(state: IFigmaState, minWidth = 0, minHeight = 0) {
  const collectNode = (nodeIds: string[], dict: IFigmaState['dict']) => {
    let frames: Array<IFigmaState['dict'][string]> = [];
    nodeIds.forEach(id => {
      const node = dict[id];
      if (
        node.type === 'FRAME' &&
        node.absoluteBoundingBox &&
        (node.absoluteBoundingBox?.width >= minWidth || node.absoluteBoundingBox?.height >= minHeight)
      ) {
        frames.push({ ...node });
      }
      if (node.children) {
        frames = frames.concat(collectNode(node.children, dict));
      }
    });
    return frames;
  };
  const document = state.dict[state.root];

  return document.children ? collectNode(document.children, state.dict) : [];
}

export async function figmaFrameToZip(
  frameId: string,
  byGroup: boolean,
  state: IFigmaState,
  figmaConfig: IFigmaParams
) {
  const zip = new JSZip();
  const imageTaskQueue: Array<Record<string, unknown>> = [];
  const frameRect = state['dict'][frameId]['absoluteBoundingBox'];
  const node = (await toNodeState(
    frameId,
    state,
    byGroup,
    { x: frameRect?.x || 0, y: frameRect?.y || 0 },
    imageTaskQueue
  )) as INodeData;
  if (imageTaskQueue.length) {
    const imageTaskNames = imageTaskQueue.reduce((names: Record<string, string>, task) => {
      const nodeId = task._$figmaNodeId as string;
      names[nodeId] = task.name as string;
      return names;
    }, {});
    const renderRes = await renderFigmaNode({
      ...figmaConfig,
      ids: imageTaskQueue.map(task => task._$figmaNodeId).join(','),
    });
    const { images: covers } = renderRes;
    const createsParam: Parameters<typeof createMaterialByUrls>[0] = {};
    for (const figmaNodeId in covers) {
      createsParam[figmaNodeId] = {
        type: ResourceType['Sprite'],
        url: covers[figmaNodeId],
        name: imageTaskNames[figmaNodeId] ?? undefined,
        distinct: true,
      };
    }

    const uploadRes = await createMaterialByUrls(createsParam);
    for (const taskProps of imageTaskQueue) {
      const figmaNodeId = taskProps._$figmaNodeId as string;
      if (uploadRes[figmaNodeId] && uploadRes[figmaNodeId].previewUrl) {
        taskProps['url'] = uploadRes[figmaNodeId].previewUrl;
        delete taskProps._$figmaNodeId;
      }
    }
  }
  const jsonName = 'psd.json';
  zip.file(jsonName, new File([JSON.stringify(node)], jsonName, { type: 'application/json' }));
  const file = await zip.generateAsync({ type: 'blob' }).then(blob => {
    return new File([blob], `${state.documentName}-${state.dict[frameId].name}_figma.zip`, {
      type: 'application/zip',
    });
  });

  return file;
}
