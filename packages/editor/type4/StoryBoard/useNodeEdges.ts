import { Node, Edge, Connection, NodeChange, EdgeChange } from 'react-flow-renderer';
import { isLoopVideoType, videoLayer, videoType, videoTypeName } from '../videoType';
import { changeEditor, restoreState } from '@editor/aStore';
import { useSelector, useStore } from 'react-redux';
import { W, H, NodeData } from './nodeTypes';
import { mapValues } from 'lodash';
import { useState } from 'react';

export const useNodes = () => {
  const { dispatch } = useStore<EditorState, EditorAction>();
  const scenes = useSelector(({ project: { scenes } }: EditorState) => scenes);
  const layers = videoLayer(scenes);
  const nodes = scenes.map<Node<NodeData>>(
    ({ id, props, name = '（未命名）', orderId, editor: { position } }, index) => {
      const { url = '' } = Object.values(props).find(({ type }) => type === 'PVVideo') ?? {};
      return {
        type: 'video',
        id: String(id),
        position: position ?? { x: W + index * (H + W), y: H },
        data: { url, name, type: `${layers[orderId] ?? ''} ${videoTypeName(videoType(orderId, scenes))}` },
      };
    }
  );
  const onNodesChange = async (changes: NodeChange[]) => {
    for (const change of changes) {
      switch (change.type) {
        case 'position':
          if (change.position) {
            dispatch(changeEditor(Number(change.id), { position: change.position }));
          }
          break;
      }
    }
  };
  return { nodes, onNodesChange };
};

export const useEdges = () => {
  const scenes = useSelector(({ project: { scenes } }: EditorState) => scenes);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [selected, setSelected] = useState('');
  const edges: Edge<string>[] = [];
  for (const { id: source, props } of scenes) {
    const loop = isLoopVideoType(props);
    for (const [id, { jumpSceneId, type, name }] of Object.entries(props)) {
      const targetScene = scenes.find(({ orderId }) => orderId === jumpSceneId);
      if (targetScene && (!loop || type !== 'PVVideo')) {
        const edgeId = `${source}-${id}`;
        edges.push({
          id: edgeId,
          zIndex: 1,
          source: String(source),
          animated: loop,
          label: loop ? name : '自动跳转',
          target: String(targetScene.id),
          selected: edgeId === selected,
          style: { stroke: edgeId === selected ? 'pink' : '#333' },
        });
      }
    }
  }
  const onConnect = ({ source, target }: Connection) => {
    if (source === target) {
      return;
    }
    const { project } = getState();
    const [sourceScene, targetScene] = [source, target].map(
      id => project.scenes.find(scene => scene.id === Number(id))!
    );
    const jumpNodes = sourceScene.nodes.filter(
      ({ id, type }) => type !== 'PVVideo' && typeof sourceScene.props[id].jumpSceneId === 'number'
    );
    if (jumpNodes.length) {
      const { id } =
        jumpNodes.find(
          ({ id }) => !project.scenes.find(({ orderId }) => sourceScene.props[id].jumpSceneId === orderId)
        ) ?? jumpNodes[jumpNodes.length - 1];
      return dispatch(
        restoreState({
          ...project,
          scenes: project.scenes.map(scene => {
            return scene.id === sourceScene.id
              ? {
                  ...scene,
                  props: { ...scene.props, [id]: { ...scene.props[id], jumpSceneId: targetScene.orderId } },
                }
              : scene;
          }),
        })
      );
    }
    return dispatch(
      restoreState({
        ...project,
        scenes: project.scenes.map(scene => {
          return scene.id === sourceScene.id
            ? {
                ...scene,
                props: mapValues(scene.props, prop => {
                  return prop.type === 'PVVideo' ? { ...prop, jumpSceneId: targetScene.orderId } : prop;
                }),
              }
            : scene;
        }),
      })
    );
  };
  const onEdgesChange = (changes: EdgeChange[]) => {
    const { project } = getState();
    for (const change of changes) {
      switch (change.type) {
        case 'remove':
          const [sceneId, nodeId] = change.id.split('-').map(Number);
          dispatch(
            restoreState({
              ...project,
              scenes: project.scenes.map(scene => {
                return scene.id === sceneId
                  ? {
                      ...scene,
                      props: mapValues(scene.props, (prop, id) => {
                        return Number(id) === nodeId ? { ...prop, jumpSceneId: 0 } : prop;
                      }),
                    }
                  : scene;
              }),
            })
          );
          break;
        case 'select':
          setSelected(selected => {
            if (!change.selected || change.id === selected) {
              return '';
            }
            return change.id;
          });
          break;
      }
    }
  };
  return { edges, onConnect, onEdgesChange };
};
