/* eslint-disable @typescript-eslint/no-unused-vars */
import { createScene } from '@shared/api/project';
import { addFromNode, deleteScene, ICaseState, newScene } from '@editor/aStore/project';
import { absoluteUrl } from '@shared/utils';
import { createNode, INodeData } from '@byted/riko';
import { addComponent, changeCategory, newCase, restoreState, useEmitter, useProject } from '@editor/aStore';
import { useScene } from '@editor/Editor/Scenes/hooks/useScene';
import {
  componentInUsed,
  fromScene,
  getScene,
  getSceneByOrderId,
  getSelectedIds,
  intoScene,
  newID,
  popPlayState,
  updateSceneId,
} from '@editor/utils';
import { message } from 'antd';
import Axios from 'axios';
import { cloneDeep } from 'lodash';
import { useCallback, useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import * as http from '@shared/api/project';

enum SceneResourceType {
  Model = '模型',
  Particle3D = '3D粒子',
  Component = '组件',
  PanoramaData = '全景',
}

// 删除场景化资源
export const useDeleteSceneResource = (type: Exclude<ICaseState['type'], 'Project' | 'History'>) => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();

  const onDeleteSceneResource = async (orderId: number) => {
    const { project } = getState();
    if (project.type === type && orderId === project.scenes[0].orderId) {
      throw new Error(`${SceneResourceType[type]}正在编辑，不能删除`);
    }
    if (componentInUsed(project, orderId)) {
      throw new Error(`${SceneResourceType[type]}正在使用，不能删除`);
    }
    const { sceneId, id } = getSceneByOrderId(project, orderId);
    await http.deleteScene(sceneId).then(() => {
      dispatch(deleteScene(id));
    });
  };

  return { onDeleteSceneResource };
};

export const useParticle3D = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const projectId = useProject('id');
  const { getSceneFromUrl } = useScene();

  const createEmptyParticleSystem3D = async () => {
    let scene = newScene('粒子', {
      type: 'Particle3D',
      nodes: [await createNode('粒子', 'ParticleSystem3D', newID, '')],
      edit3d: true,
    });
    const { id, orderId } = await createScene({
      projectId,
      name: scene.name,
      sceneContent: JSON.stringify(intoScene(scene)),
    });
    scene = updateSceneId(scene, id, orderId);

    dispatch(
      addComponent({
        ...(scene as any),
        id: scene.id,
        sceneId: scene.id,
        orderId,
      })
    );

    return scene;
  };

  const onParticleNodeToScene = async (node: INodeData) => {
    const { props } = node;
    if (props?.url) {
      const { data } = await Axios.get(absoluteUrl(props.url as string));
      const { orderId, id: sceneId } = await createScene({
        name: data.name ?? '粒子容器',
        projectId,
        sceneContent: JSON.stringify(data),
      });
      dispatch(
        addComponent(
          fromScene({
            ...(data as any),
            id: sceneId,
            sceneId,
            orderId,
            parentId: props.url,
          })
        )
      );
      return orderId;
    }
    return undefined;
  };

  /**
   * 将 Particle3D 的 url 转化为场景化的 orderId
   */
  const getConvertParticleNode = async (node: INodeData): Promise<INodeData> => {
    node = cloneDeep(node);

    const dps = async (node: INodeData) => {
      if (node?.type === 'Particle3D') {
        const orderId = await onParticleNodeToScene(node);
        if (orderId) (node.props as any).url = orderId;
      } else if (node?.nodes) {
        for (let i = 0; i < node?.nodes?.length; i++) {
          await dps(node.nodes[i]);
        }
      }
    };
    await dps(node);
    return node;
  };

  /**
   * 编辑粒子时添加 3D 粒子资源
   * 将粒子资源的 nodes 平铺
   */
  const addParticle3DInEdit = async (url: string | number) => {
    const data = await getSceneFromUrl(getState().project, url);
    if (data) {
      const parentId = getScene(getState().project, undefined, false)?.id;
      let index = data.nodes.length;
      data.nodes?.forEach(node => {
        dispatch(
          addFromNode(
            parentId,
            index,
            {
              ...node,
              id: newID(),
            },
            undefined,
            undefined
          )
        );
        index++;
      });
    }
  };

  return {
    onParticleNodeToScene,
    getConvertParticleNode,
    addParticle3DInEdit,
    createEmptyParticleSystem3D,
  };
};

export const useOnIntoParticle3D = () => {
  const { canIntoParticle3D, url: particle3DUrl } = useSelector(({ project }: EditorState) => {
    const { editor, props } = getScene(project);
    const { nodeIds } = getSelectedIds(editor.selected);
    const { url = '' } = props[nodeIds[0]] ?? {};
    return { canIntoParticle3D: props[nodeIds[0]]?.type === 'Particle3D', url };
  }, shallowEqual);

  return { canIntoParticle3D, particle3DUrl };
};

export const useOnEditParticle3D = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [loading, setLoading] = useState(false);
  const { getSceneFromUrl } = useScene();
  const emit = useEmitter('LoadComponent');
  return {
    loading,
    onEditParticle3D: useCallback(
      async (url: string | number) => {
        let oldOne = popPlayState(getState().project);
        oldOne = { ...oldOne, editor: { ...oldOne.editor, contextMenu: undefined } };
        const loadParticle3D = async () => {
          try {
            setLoading(true);
            const scene = await getSceneFromUrl(oldOne, url);
            scene.editor.edit3d = true;
            const newOne = newCase([scene], 'Particle3D', oldOne);
            newOne.editor.readOnly = typeof url === 'string' || oldOne.editor.readOnly;
            newOne.settings.store = oldOne.settings.store;
            newOne.settings.layerCollisions = oldOne.settings.layerCollisions;
            newOne.settings.layerCollisionName = oldOne.settings.layerCollisionName;
            newOne.materials = oldOne.materials;
            newOne.texture2Ds = oldOne.texture2Ds;
            // 保留project id用于更新
            newOne.id = oldOne.id;
            dispatch(restoreState(newOne));
            dispatch(changeCategory(''));
          } catch (e) {
            message.error('不能编辑粒子');
            setLoading(false);
          }
        };
        if (oldOne.type !== 'Project') {
          emit({ loadComponent: loadParticle3D });
        } else {
          loadParticle3D();
        }
      },
      [getState, dispatch, emit]
    ),
  };
};
