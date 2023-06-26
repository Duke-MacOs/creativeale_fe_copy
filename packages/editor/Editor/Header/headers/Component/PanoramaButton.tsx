/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useState } from 'react';
import { useStore } from 'react-redux';
import { Button, message } from 'antd';
import { changeCategory, restoreState, setSettings } from '@editor/aStore';
import { usePersistCallback } from '@byted/hooks';
import {
  useCreatePanoramaComponent,
  useSavePanoramaComponents,
  useSavePanoramaDataList,
  useSavePanoramaSpaceNode,
  useUpdatePanoramaMode,
} from '@editor/Template/Panorama/hooks';

export default memo(
  ({ children, changed, disabled }: { disabled: boolean; changed: boolean; children: React.ReactNode }) => {
    const savePanoramaComponents = useSavePanoramaComponents();
    const createPanoramaComponent = useCreatePanoramaComponent();
    const savePanoramaDataList = useSavePanoramaDataList();
    const savePanoramaSpaceNode = useSavePanoramaSpaceNode();
    const updatePanoramaMode = useUpdatePanoramaMode();

    const [submitting, setSubmitting] = useState(false);
    const { dispatch, getState } = useStore<EditorState, EditorAction>();
    const onClick = usePersistCallback(async () => {
      const state = await savePanoramaDataList();
      let prevState = state.editor.prevState;
      if (prevState) {
        try {
          if (changed) {
            setSubmitting(true);
            const panoramaComponents = await createPanoramaComponent();
            if (panoramaComponents.length !== 0) {
              // 保存 panorama component
              prevState = savePanoramaComponents(state, panoramaComponents).editor.prevState;
              // 保存 panoramaSpace node
              await savePanoramaSpaceNode();
            }
            setSubmitting(false);
          }
        } catch (error) {
          message.error(error?.data?.message || error?.message || error);
          setSubmitting(false);
        } finally {
          dispatch(restoreState(prevState!));
          dispatch(changeCategory(''));
          dispatch(
            setSettings({
              store: getState().project.settings.store,
            })
          );
          updatePanoramaMode({
            enabled: false,
          });
          setSubmitting(false);
        }
      }
    });
    return (
      <Button
        style={{ marginLeft: '8px' }}
        size="large"
        disabled={disabled}
        type={'primary'}
        loading={submitting}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }
);
