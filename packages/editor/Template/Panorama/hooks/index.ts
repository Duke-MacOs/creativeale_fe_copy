import { createMaterialByUrls } from '@shared/api/library';
import { createScene, updateScene } from '@shared/api/project';
import {
  IPanoramaData,
  ICubemap,
  addCubeMap,
  newScene,
  addPanoramaViewer,
  addComponent,
  newCase,
  restoreState,
  changeCategory,
  ISceneState,
  useEditor,
  useAddNode,
  useAddNodeWith3D,
  changeProps,
  changeEditor,
  useProject,
  ICaseState,
  IPanorama,
  ISpace,
} from '@editor/aStore';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import {
  checkPanoramaData,
  dbServer,
  getFirstPanorama,
  getNodesComponentByPanoramaId,
  getPanoramaSpaceNodePop,
  getPanoramaSpaceNodeShift,
  giftMode,
  isVRCase,
  translateXingfuli,
} from '../utils';
import { createAsset } from '@byted/riko';
import { ResourceType } from '@editor/Resource/upload/accepted';
import { getRikoAssetProps } from '@editor/Resource/entries/3d/utils';
import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import {
  fromScene,
  getAllByOrderId,
  getPanoramaDataList,
  getScene,
  getSearchParams,
  getSelectedIds,
  intoScene,
  newID,
  popPlayState,
  updateSceneId,
} from '@editor/utils';
import { message, Modal } from 'antd';
import * as utils from '../utils';
import { useEventBus } from '@byted/hooks';
import { ActionType } from '@byted/riko';
import { createResource } from '@shared/api';
import { GIFT_MODE_CONFIG } from '../config';
import { absoluteUrl, relativeUrl } from '@shared/utils';
import { useHandleCubemapAsset } from '@editor/Resource/upload';

/**
 * 切换全景时，通知 riko 更新
 * data:{
 *  enabled: 是否开启全景模式,
 *  cubemapUrl:
 * }
 * @returns
 */
export const useUpdatePanoramaMode = () => {
  const { trigger } = useEventBus('editorSender');
  const { getState } = useStore<EditorState, EditorAction>();

  return (data?: any) => {
    const { panoramaEdit } = getState().project.editor;
    const selectedPanorama = getPanoramaDataList(getState().project)
      .find(i => i.orderId === panoramaEdit.panoramaDataOrderId)
      ?.panoramas?.find(i => i.id === panoramaEdit.panoramaId);

    trigger({
      type: ActionType.EditorState,
      state: 'PanoramaMode',
      data: {
        fixedCameraView: selectedPanorama?.fixedCameraView,
        fixedCameraViewOnce: selectedPanorama?.fixedCameraViewOnce,
        enabled: panoramaEdit.type !== undefined,
        cubemapUrl: selectedPanorama?.cubemapUrl,
        rotation: selectedPanorama?.rotation,
        ...data,
      },
    });
  };
};

export const useOnIntoPanorama = () => {
  const {
    canIntoPanorama,
    url: nodeComponentUrl,
    id: panoramaSpaceId,
  } = useSelector(({ project }: EditorState) => {
    const { editor, props } = getScene(project);
    const { nodeIds } = getSelectedIds(editor.selected);
    const node = props[nodeIds[0]];
    return { canIntoPanorama: node?.type === 'PanoramaSpace', url: Number(node?.dataUrl), id: Number(nodeIds[0]) };
  }, shallowEqual);

  return { canIntoPanorama, nodeComponentUrl, panoramaSpaceId };
};

export const useOnEditPanorama = () => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const [loading, setLoading] = useState(false);
  const updatePanoramaMode = useUpdatePanoramaMode();
  return {
    loading,
    onEditPanorama: useCallback(
      async (panoramaDataOrderId: number, panoramaSpaceId: number, state?: ICaseState) => {
        const project = state ?? getState().project;
        const {
          panoramaEdit: { mainSceneId },
        } = project.editor;
        let oldOne = popPlayState(project);
        oldOne = { ...oldOne, editor: { ...oldOne.editor, contextMenu: undefined } };
        const loadPanorama = async () => {
          try {
            setLoading(true);
            const loadScene = project.scenes.find(i => i.type === 'Scene' && i.orderId === 1);
            const mainScene =
              project.scenes.find(i => i.id === mainSceneId) ??
              (isVRCase(getState().project) ? project.scenes.find(i => i.name === '主场景') : getScene(project))!;
            const panoramaDataList = getPanoramaDataList(project);
            const panoramaData = panoramaDataList.find(i => i.orderId === panoramaDataOrderId);
            if (!panoramaData) throw new Error();
            const panoramaId = panoramaData.panoramas[0]?.id ?? 0;
            const panoramaComponents: ISceneState[] = panoramaData.panoramas
              .map(p => {
                return getAllByOrderId(project, p.nodesComponentUrl);
              })
              .filter(i => i !== undefined) as any;

            const startPanorama =
              panoramaData.panoramas.find(i => {
                return (
                  i.id ===
                  oldOne.scenes.find(i => i.id === oldOne.editor.selectedSceneId)?.props?.[panoramaSpaceId]
                    ?.startPanoramaId
                );
              }) ?? getFirstPanorama(panoramaData);

            const newOne = newCase(
              (loadScene ? [loadScene] : []).concat([mainScene, ...panoramaComponents]),
              'PanoramaData',
              oldOne
            );
            newOne.name = project.name;
            newOne.extra = oldOne.extra;
            newOne.editor.readOnly = oldOne.editor.readOnly;
            newOne.editor.panoramaEdit = {
              ...oldOne.editor.panoramaEdit,
              panoramaDataOrderId: panoramaData.orderId ?? 0,
              panoramaId: startPanorama?.id ?? panoramaId,
              panoramaSpaceId,
              mainSceneId: mainScene.id,
              type: 'panorama',
            };
            // 设置选中 panorama node component 组件
            if (startPanorama) {
              newOne.editor.selectedSceneId = getAllByOrderId(project, startPanorama?.nodesComponentUrl)?.id;
            }
            newOne.settings.enabled3d = true;
            newOne.settings = oldOne.settings;

            newOne.panoramaDataList = panoramaDataList;
            newOne.materials = oldOne.materials;
            // 保留project id用于更新
            newOne.id = oldOne.id;
            dispatch(restoreState(newOne));
            dispatch(changeCategory(''));
            updatePanoramaMode({
              enabled: true,
            });
          } catch (e) {
            message.error('不能编辑全景,请上传全景文件');
            console.error(e);
            setLoading(false);
          }
        };
        loadPanorama();
      },
      [getState, dispatch, updatePanoramaMode]
    ),
  };
};

export const useChangeModeInPanoramaData = () => {
  const { getState, dispatch } = useStore<EditorState, EditorAction>();
  const { panoramaEdit } = useProject('editor');
  const updatePanoramaMode = useUpdatePanoramaMode();
  return (edit3d: boolean) => {
    if (edit3d && panoramaEdit.panoramaId) {
      const scene = getNodesComponentByPanoramaId(getState().project, panoramaEdit.panoramaId);
      if (scene) {
        dispatch(changeEditor(0, { selectedSceneId: scene?.id, panoramaEdit: { ...panoramaEdit, type: 'panorama' } }));
        dispatch(changeEditor(scene.id, { edit3d: true, selected: {} }));
      }
    } else {
      const scene = getState().project.scenes.find(i => i.id === panoramaEdit.mainSceneId);
      if (scene) {
        dispatch(changeEditor(0, { selectedSceneId: scene.id, panoramaEdit: { ...panoramaEdit, type: undefined } }));
        dispatch(changeEditor(scene.id, { edit3d: false, selected: {} }));
        dispatch(changeCategory(''));
      }
    }
    updatePanoramaMode();
  };
};

export const usePanoramaEdit = () => {
  const onAddNode = useAddNode();
  const onAddNodeWith3D = useAddNodeWith3D();
  const { onEditPanorama } = useOnEditPanorama();
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const { onChange: onChangeLoading } = useEditor(0, 'loading');
  const handleCubemapAsset = useHandleCubemapAsset();
  const { projectId, projectName } = useSelector(
    ({ project }: EditorState) => ({
      projectId: project?.id,
      projectName: project.name,
    }),
    shallowEqual
  );
  const hasInitial = useRef(false);

  // 场景化 cubemap 数据
  const createCubemapResourceScene = async (
    cubemapProps: Exclude<ICubemap, ['id', 'orderId']>,
    name = '全景图'
  ): Promise<ICubemap> => {
    cubemapProps.cover = absoluteUrl(cubemapProps.props.textureUrls[0]);
    cubemapProps.name = name;
    const { id, orderId } = await createScene({
      projectId: projectId,
      name,
      sceneContent: JSON.stringify(cubemapProps),
    });

    return { ...cubemapProps, id, orderId };
  };

  const createPanoramaResourceScene = async (panorama: IPanoramaData) => {
    // 场景化完整 state
    const { id, orderId } = await createScene({
      projectId: projectId,
      name: projectName ?? 'PanoramaData',
      sceneContent: JSON.stringify(panorama),
    });
    panorama.id = id;
    panorama.orderId = orderId;
    dispatch(addPanoramaViewer(panorama));
    return orderId;
  };

  const handleNodeComponent = async (spaceId: number, panoramaId: number, name = 'panoramaNodeComponent') => {
    let newComp = newScene(name, { loading: false, type: 'Animation3D', edit3d: true, isOpen: false });

    const { id, orderId } = await createScene({
      projectId: projectId,
      name: 'Space',
      sceneContent: JSON.stringify(newComp),
    });
    newComp = updateSceneId(newComp, id, orderId);
    newComp.props[newComp.id].spaceId = spaceId;
    newComp.props[newComp.id].panoramaId = panoramaId;

    dispatch(addComponent(newComp));
    return orderId;
  };

  const createSpace = async (): Promise<ISpace> => {
    return await utils.createSpace();
  };

  const handlePanoUrl = async (urls: string[], name = '全景图') => {
    let key = 0;
    const record: Record<number, any> = {};
    urls.forEach(url => {
      record[key++] = {
        type: ResourceType['Sprite'],
        url,
      };
    });
    const data = await createMaterialByUrls(record);

    // 调用 riko 接口，获取 panorama 资源
    const rikoAsset = await getRikoAssetProps(
      await createAsset(
        name,
        'Cubemap',
        Object.values(data).map((i: any) => relativeUrl(i.url) + `?ext=${i.url.split('.').pop()}&width=1024`)
      )
    );

    const cubemap = await createCubemapResourceScene(rikoAsset.files[rikoAsset.entry], name);
    dispatch(addCubeMap(cubemap));

    return cubemap.orderId;
  };
  const handleModel = async (_originUrl: string) => {
    const file = await axios.get(_originUrl, { responseType: 'blob' });
    const { url } = await createResource({
      file: new File([file.data], '幸福里模型.glb'),
      type: 27,
      projectId,
      name: '未命名',
    });
    const { data: rootComponent } = await axios.get(url);
    const { orderId, id: sceneId } = await createScene({
      name: '未命名',
      projectId,
      sceneContent: JSON.stringify(rootComponent),
    });

    // 更新场景数据
    dispatch(
      addComponent(
        fromScene({
          ...(rootComponent as any),
          id: sceneId,
          sceneId,
          orderId,
          parentId: url,
        })
      )
    );
    return orderId;
  };

  const translateOuterData = async (data: any): Promise<number[]> => {
    const panoramaStateList = await translateXingfuli(data, handlePanoUrl, handleNodeComponent, handleModel);
    panoramaStateList.forEach(checkPanoramaData);
    return await Promise.all((await panoramaStateList).map(createPanoramaResourceScene));
  };

  const createEmptyPanoramaData = async ({ cubemapOrderId }: { cubemapOrderId?: number }): Promise<number> => {
    const panoramaDataId = newID();
    const space = await createSpace();
    const panorama = await createPanorama(space.id, cubemapOrderId);
    space.panoramaIds.push(panorama.id);
    const state: IPanoramaData = {
      id: panoramaDataId,
      type: 'PanoramaData',
      spaces: [space],
      modelUrl: '',
      totalSize: [1, 1, 1],
      panoramas: [panorama],
      landMarkUrl: '',
      plan: {
        viewerUrl: '',
        planUrl: '',
      },
    };
    return await createPanoramaResourceScene(state);
  };

  const getSearchUrl = (): string | null => {
    return window.localStorage.getItem(`vrhouse_${getSearchParams().vrhouse}`);
  };

  const delSearchUrl = () => {
    let path = location.href;
    path = path.replace('emptyVR=1', '');
    path = path.replace('initialVR=1', '');
    path = path.replaceAll(/imgId=(.*?)&/g, '');
    path = path.replaceAll(/assetType=(.*?)&/g, '');
    path = path.replaceAll(/vrhouse=(.*?)&/g, '');

    window.history.replaceState({}, '', path);
    window.localStorage.removeItem(`vrhouse_${getSearchParams().vrhouse}`);
  };

  const getOriginConfig = async (url: string) => {
    return await axios.get(url);
  };

  // 初始化外部链接
  const initialUrl = async (url: string) => {
    const { data } = await getOriginConfig(url);
    const orderIds = await translateOuterData(data);

    // 探寻宝箱玩法：
    // 将宝箱、地标等组件插入第一个全景组件中
    dispatch(restoreState(await giftMode(getState().project, orderIds[0], GIFT_MODE_CONFIG)));

    return orderIds;
  };

  const initialPanoramaState = async (dataUrl?: string): Promise<number[]> => {
    let orderIds: number[] = [];
    if (dataUrl) hasInitial.current = false;
    if (hasInitial.current === false) {
      try {
        let cubemapOrderId = 0;
        const { assetType, imgId, emptyVR, initialVR } = getSearchParams();
        const url = dataUrl ?? getSearchUrl();

        // 上传资源： 0(2:1大图) 1(六面体图面)
        if (assetType === '0' || assetType === '1') {
          const res = await dbServer.get(Number(imgId));
          if (res) {
            const cubemap = await handleCubemapAsset(res.files);
            cubemapOrderId = cubemap[0].url;
          }
        }

        // 新增 PanoramaData
        if (url) {
          orderIds = await initialUrl(url);
        } else if (cubemapOrderId || emptyVR === '1') {
          const orderId = await createEmptyPanoramaData({ cubemapOrderId });
          orderIds.push(orderId);
        }

        // 如果没有选择模板，则新生成一个全景节点
        // 如果选择了模板，并且上传了资源，则将原有全景节点的数据进行替换
        if (emptyVR === '1') {
          await createPanoramaSpaceNode(orderIds[0]);
        } else if (initialVR === '1' && (url || cubemapOrderId)) {
          const scene = getState().project.scenes.find(i => i.type === 'Scene' && i.name === '主场景');
          if (scene) {
            const id = Object.entries(scene.props).find(([, value]) => value.type === 'PanoramaSpace')?.[0];
            dispatch(
              changeEditor(0, {
                selectedSceneId: scene.id,
              })
            );
            id && dispatch(changeProps([Number(id)], { dataUrl: orderIds[0], startPanoramaId: -1 }));
          }
        }
      } catch (error) {
        throw error;
      }
    }

    hasInitial.current = true;
    return orderIds;
  };

  const replaceDataInPanoramaEdit = async (url: string, spaceId: number): Promise<number[]> => {
    onChangeLoading(true);
    let orderIds: number[] = [];
    try {
      const { data } = await getOriginConfig(url);
      orderIds = await translateOuterData(data);
      const state = await giftMode(getState().project, orderIds[0], GIFT_MODE_CONFIG);

      // 更新 space 节点 orderId
      const {
        panoramaEdit: { mainSceneId },
      } = state.editor;

      const mainScene = state.scenes.find(i => i.id === mainSceneId);
      if (mainScene && mainScene.type === 'Scene') {
        mainScene.props[spaceId].dataUrl = orderIds[0];

        await updateScene({
          sceneContent: JSON.stringify(intoScene(mainScene)),
          name: mainScene.name || 'Scene',
          id: mainScene.sceneId,
          projectId: state.id,
        });
        await onEditPanorama(orderIds[0], spaceId, state);
      } else {
        throw new Error('无法获取 mainScene');
      }
    } catch (error) {
      Modal.error({
        title: '错误',
        content: `替换看房数据失败:${error.message}`,
      });
      console.error(error);
    } finally {
      onChangeLoading(false);
    }
    return orderIds;
  };

  const createPanorama = async (spaceId: number, cubemapUrl = 0): Promise<IPanorama> => {
    const newPanorama = await utils.createPanorama(spaceId, handleNodeComponent);
    const orderId = await handleNodeComponent(spaceId, newPanorama.id);
    return { ...newPanorama, nodesComponentUrl: orderId, cubemapUrl: cubemapUrl };
  };

  const createPanoramaSpaceNode = async (orderId: number | string = ''): Promise<number> => {
    return await onAddNodeWith3D('PanoramaSpace', async () => {
      return await onAddNode(
        {
          mime: 'PanoramaSpace',
          name: '全景空间',
          url: orderId,
          edit3d: true,
        },
        true
      );
    });
  };

  const createPanoramaHotSpot = () => {
    onAddNodeWith3D('PanoramaHotSpot', () => {
      onAddNode(
        {
          mime: 'PanoramaHotSpot',
          name: '热点',
          url: '',
        },
        true
      );
    });
  };

  /**
   * 寻宝玩法初始化
   */
  const initialGiftMode = async () => {
    const mainScene = getState().project.scenes.find((i: any) => i.name === '主场景')!;
    const scene = intoScene(mainScene);
    const scene3D = scene.nodes?.find(i => i.type === 'Scene3D');
    const panoramaSpace = scene3D?.nodes?.find(i => i.type === 'PanoramaSpace');
    if (panoramaSpace) {
      const orderIds = await initialPanoramaState();
      if (orderIds.length !== 0) {
        dispatch(changeProps([panoramaSpace.id], { dataUrl: orderIds[0], startPanoramaId: -1 }));
      }
    }
  };

  /**
   * 自动进入全景编辑页面。
   */
  const autoEnterPanoramaEdit = async (isEmptyVR?: boolean) => {
    const panoramaSpaceNode = isEmptyVR
      ? getPanoramaSpaceNodePop(getState().project)
      : getPanoramaSpaceNodeShift(getState().project);
    if (panoramaSpaceNode) {
      onEditPanorama(panoramaSpaceNode.props!.dataUrl as number, panoramaSpaceNode.id);
    }
  };

  (window as any).getStatecz = getState;

  return {
    initialPanoramaState,
    createPanorama,
    createSpace,
    createPanoramaSpaceNode,
    createCubemapResourceScene,
    createPanoramaHotSpot,
    delSearchUrl,
    initialGiftMode,
    autoEnterPanoramaEdit,
    replaceDataInPanoramaEdit,
  };
};

export * from './useSaving';
export * from './usePanoramaUI';
export * from './useUpload';
