import {
  changeEditor,
  IPanorama,
  ISpace,
  updatePanoramaData,
  useEditor,
  useEditorHotkeys,
  useOnDelete,
} from '@editor/aStore';
import { Settings, shouldSettingsOn } from '@editor/Editor/Scenes';
import { getPanoramaDataList, getScene } from '@editor/utils';
import { Button, message } from 'antd';
import { useEffect } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { usePanoramaEdit, useUpdatePanoramaMode } from '../hooks';
import {
  getNodesComponentBySpaceId,
  getNodesComponentByPanoramaId,
  getFirstPanorama,
  isVRCaseAndInEdit,
} from '../utils';
import Bottom from './Bottom';
import Space from './Space';

export default () => {
  const { onDelete } = useOnDelete();
  useEditorHotkeys('delete,backspace', () => {
    const {
      editor: { edit3d },
    } = getScene(getState().project);
    edit3d && onDelete();
  });
  const { dispatch, getState } = useStore();
  const { createPanorama, createSpace } = usePanoramaEdit();
  const updatePanoramaMode = useUpdatePanoramaMode();
  const { propsMode } = useEditor(0, 'propsMode');
  const {
    panoramaData,
    panoramaEdit,
    spaces,
    settings,
    editor: { sceneMode, settingsOn },
  } = useSelector(({ project }: EditorState) => {
    const { panoramaDataOrderId } = project.editor.panoramaEdit;
    const panoramaData = getPanoramaDataList(project).find((i: any) => i.orderId === panoramaDataOrderId)!;
    const spaces = panoramaData?.spaces ?? [];
    const panoramas = panoramaData?.panoramas ?? [];
    return {
      panoramaAreaComponents: project.scenes,
      panoramaEdit: project.editor.panoramaEdit,
      spaces,
      panoramaData,
      panoramas,
      editor: project.editor,
      settings: project.settings,
    };
  }, shallowEqual);
  const settingsEnabled = shouldSettingsOn(sceneMode, settings);

  useEffect(() => {
    updatePanoramaMode({
      enabled: true,
    });

    return () => {
      updatePanoramaMode({
        enabled: false,
      });
    };
  }, []);
  const onClickSpace = (spaceId: number) => {
    const component = getNodesComponentBySpaceId(getState().project, spaceId);
    dispatch(
      changeEditor(0, {
        selectedSceneId: component?.id,
        settingsOn: false,
        panoramaEdit: {
          ...panoramaEdit,
          type: 'space',
          spaceId: spaceId,
          panoramaId: panoramaData.spaces.find(i => i.id === spaceId)?.panoramaIds[0] ?? 0,
        },
      })
    );
    component && dispatch(changeEditor(component.id, { selected: {} }));
    updatePanoramaMode();
  };

  const onClickPanorama = (panoramaId: number) => {
    const component = getNodesComponentByPanoramaId(getState().project, panoramaId);
    if (component) {
      dispatch(
        changeEditor(0, {
          settingsOn: false,
          selectedSceneId: component.id,
          panoramaEdit: { ...panoramaEdit, type: 'panorama', panoramaId: panoramaId },
        })
      );
      dispatch(changeEditor(component.id, { selected: {} }));
      if (panoramaEdit.panoramaId !== panoramaId) updatePanoramaMode();
    } else {
      message.error('全景组件丢失');
    }
  };

  const onAddPanorama = async (spaceId: number) => {
    const panorama = await createPanorama(spaceId);
    dispatch(
      updatePanoramaData(panoramaData.id, {
        spaces: panoramaData?.spaces.map(space => {
          return space.id === spaceId
            ? {
                ...space,
                panoramaIds: [...space.panoramaIds, panorama.id],
              }
            : space;
        }),
        panoramas: [...panoramaData.panoramas, panorama],
      })
    );
  };

  const resetSelectedPanorama = () => {
    const panorama = getFirstPanorama(panoramaData);
    const component = panorama ? getNodesComponentByPanoramaId(getState().project, panorama.id) : undefined;
    if (panorama && component) {
      dispatch(
        changeEditor(0, {
          settingsOn: false,
          selectedSceneId: component?.id,
          panoramaEdit: { ...panoramaEdit, type: 'panorama', panoramaId: panorama.id },
        })
      );
      dispatch(changeEditor(component.id, { selected: {} }));
    } else {
      // 没有全景
      dispatch(
        changeEditor(0, {
          selectedSceneId: undefined,
          panoramaEdit: { ...panoramaEdit, type: undefined },
        })
      );
    }
    updatePanoramaMode();
  };

  const onDelPanorama = (panoramaId: number) => {
    if (panoramaData.panoramas.length === 1) {
      message.error('无法删除，需至少保留一个全景');
      return;
    }
    dispatch(
      updatePanoramaData(panoramaData.id, {
        spaces: panoramaData.spaces.map(space => {
          return {
            ...space,
            panoramaIds: space.panoramaIds.filter(i => i !== panoramaId),
          };
        }),
        panoramas: panoramaData.panoramas
          .filter(i => i.id !== panoramaId)
          .map(i => ({
            ...i,
            pathways: i.pathways?.filter(id => id !== panoramaId) ?? [],
          })),
      })
    );
    if (panoramaId === panoramaEdit.panoramaId) {
      resetSelectedPanorama();
    }
  };

  const onAddSpace = async () => {
    const space = await createSpace();
    dispatch(
      updatePanoramaData(panoramaData.id, {
        spaces: [...panoramaData.spaces, space],
      })
    );
  };

  const onDelSpace = async (spaceId: number) => {
    let delPanoramas: number[] = [];
    const spaces = panoramaData.spaces.filter(space => {
      if (space.id === spaceId) delPanoramas = space.panoramaIds;
      return space.id !== spaceId;
    });
    if (panoramaData.panoramas.length === 1 && delPanoramas.includes(panoramaData.panoramas[0].id)) {
      message.error('无法删除，需至少保留一个全景');
      return;
    }
    dispatch(
      updatePanoramaData(panoramaData.id, {
        spaces,
        panoramas: panoramaData.panoramas
          .filter(i => !delPanoramas.includes(i.id))
          .map(i => ({
            ...i,
            pathways: i.pathways?.filter(id => !delPanoramas.includes(id)) ?? [],
          })),
      })
    );
    if (spaceId === panoramaEdit.spaceId || delPanoramas.includes(panoramaEdit.panoramaId)) {
      resetSelectedPanorama();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '10px 15px',
      }}
    >
      {['Project', 'Product'].includes(propsMode) && isVRCaseAndInEdit(getState().project) && (
        <Button
          style={{ marginBottom: '10px' }}
          onClick={() => {
            const sceneId = getState().project.scenes.find((i: any) => i.orderId === 1).id;
            dispatch(
              changeEditor(0, {
                settingsOn: false,
                selectedSceneId: sceneId,
                panoramaEdit: {
                  ...panoramaEdit,
                  type: undefined,
                },
              })
            );
            dispatch(changeEditor(sceneId, { playable: true }));
          }}
        >
          直出互动设置
        </Button>
      )}
      {settingsEnabled && <Settings active={settingsOn} />}
      <div style={{ height: '90%' }}>
        <div style={{ height: '100%', overflowY: 'scroll', marginBottom: '10px' }}>
          {spaces.map((space: ISpace) => {
            const panoramas = space.panoramaIds.reduce((prev, current) => {
              const p = panoramaData?.panoramas?.find(i => i.id === current);
              if (p) prev.push(p);
              return prev;
            }, [] as IPanorama[]);
            return (
              <Space
                key={space.id}
                space={space}
                panoramas={panoramas}
                panoramaEdit={panoramaEdit}
                onClickSpace={() => {
                  onClickSpace(space.id);
                }}
                onClickPanorama={onClickPanorama}
                onAddPanorama={() => {
                  onAddPanorama(space.id);
                }}
                onDelPanorama={onDelPanorama}
                onDelSpace={() => {
                  onDelSpace(space.id);
                }}
              />
            );
          })}
        </div>
      </div>

      {propsMode === 'Project' && <Bottom onAddSpace={onAddSpace} />}
    </div>
  );
};
