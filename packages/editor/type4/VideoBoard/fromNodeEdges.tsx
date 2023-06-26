import { SCENE_FIXTURE_VERSION } from '../../Editor/Header/hooks/compatibles/version';
import { centerNode, fromScene, newID } from '@editor/utils';
import { Edge, Node, XYPosition } from 'react-flow-renderer';
import { UploadEntry } from '@editor/Resource/upload';
import { createNode, INodeData } from '@byted/riko';
import { ISceneState } from '@editor/aStore';

type Item = { id: string; position: XYPosition | undefined; nextIds: string[]; isLoopVideo: boolean };

export const fromNodeEdges = (videos: UploadEntry[], nodes: Node[], edges: Edge[]) => {
  return resolveVideoScenes(videos, resolveNodeEdges(nodes, edges));
};

const resolveNodeEdges = (nodes: Node[], edges: Edge[]) => {
  edges = edges.filter(({ source, target }) => [source, target].every(st => nodes.some(({ id }) => id === st)));
  const endVideos = nodes.filter(
    ({ id }) => edges.some(({ target }) => target === id) && edges.every(({ source }) => source !== id)
  );
  if (!endVideos.length) {
    throw new Error('不能没有结束视频');
  }
  const next = (ids: string[], items: Array<Item> = []): typeof items => {
    for (const id of ids) {
      if (items.some(item => item.id === id)) {
        continue;
      }
      const item = {
        id,
        position: nodes.find(node => node.id === id)?.position,
        isLoopVideo: edges.some(({ source, animated }) => source === id && animated),
        nextIds: nodes
          .filter(node => edges.find(({ source, target }) => source === id && target === node.id))
          .map(({ id }) => id),
      };

      if (id !== '0') {
        items.push(item);
      }
      items = next(item.nextIds, items);
    }
    return items;
  };
  return next(nodes.filter(({ id }) => edges.every(({ target }) => target !== id)).map(({ id }) => id));
};

const resolveVideoScenes = async (videos: UploadEntry[], items: Array<Item>): Promise<ISceneState[]> => {
  return await Promise.all(
    items.map(async ({ id, position, nextIds, isLoopVideo }) => {
      const { name, url } = videos.find(video => video.id === id)!;
      const videoNode = await pvVideo(
        name,
        url,
        nextIds.length === 1 ? items.findIndex(({ id }) => id === nextIds[0]) + 1 : 0
      );
      if (!isLoopVideo) {
        return pvScene([videoNode], position);
      }
      const deltaY = 1280 / (nextIds.length + 1);
      return pvScene(
        [
          ...nextIds.map((id, index) => {
            return pvHotArea(items.findIndex(video => video.id === id) + 1, deltaY * (index + 1));
          }),
          videoNode,
        ].reverse(),
        position
      );
    })
  );
};

const pvScene = (nodes: INodeData[], position?: XYPosition): ISceneState => {
  const id = newID();
  return {
    ...fromScene({
      id,
      type: 'Scene',
      scripts: [],
      editor: {
        scale: 50,
        moment: 0,
        edit3d: false,
        dataVersion: SCENE_FIXTURE_VERSION,
        dragOffsetX: 0,
        dragOffsetY: 0,
        position,
      },
      props: {
        name: nodes.find(({ type }) => type === 'PVVideo')?.props?.name ?? '视频场景',
        width: 720,
        height: 1280,
      },
      nodes,
    }),
    sceneId: id,
    orderId: 1,
  };
};

const pvVideo = async (name: string, url: string, jumpSceneId: number) => {
  const node = centerNode(await createNode(name, 'PVVideo', newID, url), 720, 1280);
  node.props = { ...node.props, jumpSceneId };
  node.editor = { ...node.editor, isLocked: true };
  node.scripts![0].props.loop = true;
  return node;
};

const pvHotArea = (jumpSceneId: number, y: number) => {
  return {
    id: newID(),
    type: 'PVClickArea',
    editor: {
      isLocked: false,
      isHidden: false,
    },
    scripts: [],
    nodes: [],
    props: {
      x: 120,
      y: y - 60,
      width: 480,
      height: 120,
      rotation: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      enabled: true,
      name: '点击热区',
      shapeType: 'rectangle',
      fillColor: '#2860ED88',
      showGuide: false,
      jumpSceneId,
      _editor: {
        lockedRatio: false,
      },
    },
  };
};
