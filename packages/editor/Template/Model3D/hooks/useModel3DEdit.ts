/* eslint-disable @typescript-eslint/no-unused-vars */
import { createModelNode, INodeData } from '@byted/riko';
import { changeProps, restoreState, selectNode, updateGlobalVars } from '@editor/aStore';
import { fromScene, getScene, getSceneByOrderId, intoScene, newID, openKeysToCompProps } from '@editor/utils';
import { useStore } from 'react-redux';
import Axios from 'axios';
import { absoluteUrl } from '@shared/utils';
import { isCar3D } from '../utils';

export const useModel3DEdit = () => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();

  /**
   * 替换汽车模型
   *
   */
  const replaceCarModelInProduct = async (sourceNodeId: number, url: number | string, otherProps = {}) => {
    // 获取节点数据
    let component: any;
    if (typeof url === 'string') {
      const { data } = await Axios.get(absoluteUrl(url));
      component = data;
    }
    if (typeof url === 'number') {
      component = getSceneByOrderId(getState().project, url);
    }
    const newNode = await createModelNode(
      'model',
      url,
      newID,
      typeof url === 'string' ? component : intoScene(openKeysToCompProps(component), ['store', 'type'])
    );

    // 替换 editor.layerAnimations
    const state = getState().project;
    const scene = state.scenes.find(i => Object.keys(i.props).includes(`${sourceNodeId}`));
    if (scene && newNode) {
      const sceneData = intoScene(scene);
      const getNode = (nodes: INodeData[] | undefined, id: number): INodeData | undefined => {
        return nodes?.find(i => i.id === id) || nodes?.map(i => getNode(i.nodes, id)).filter(i => i)[0];
      };
      const node: any = getNode(sceneData.nodes, sourceNodeId);

      if (node) {
        const scripts = newNode.scripts?.filter(i => i.type === 'Controller');
        node.scripts = node.scripts.filter((i: any) => i.type !== 'Controller');
        if (scripts) {
          scripts.forEach(s => {
            s.props.enabled = false;
            node.scripts.push(s);
          });
        }
        node.editor.layerAnimations = newNode.editor?.layerAnimations;
      }
      dispatch(
        restoreState({
          ...state,
          scenes: state.scenes.map(i => (i.id === sceneData.id ? openKeysToCompProps(fromScene(sceneData)) : i)),
        })
      );
      dispatch(
        changeProps([sourceNodeId], {
          url,
          ...otherProps,
        })
      );
      // 在 3D 看车项目中，需要将动画名称放入场景数据
      if (isCar3D(getState().project)) {
        const scene = getScene(getState().project);
        const sceneData: any = scene.props[scene.id].sceneData || {};
        dispatch(
          changeProps([getScene(getState().project).id], {
            sceneData: {
              ...sceneData,
              carAnimations: node.editor.layerAnimations?.map((i: any) => i[0]?.[0]) ?? [],
            },
          })
        );
      }

      dispatch(selectNode([sourceNodeId]));
    }
  };

  return {
    replaceCarModelInProduct,
  };
};
