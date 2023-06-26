/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { ActionFlag } from '@byted/riko';
import { Layout, message } from 'antd';
import { useSelector, useStore } from 'react-redux';
import {
  changeCanvasScale,
  changeEditor,
  getProjectHeight,
  selectNode,
  selectScript,
  setSettings,
  useEditor,
} from '../aStore';
import { useSceneStack, useStateStack } from './hooks/useStack';
import { getSelectedIds, intoScene } from '../utils';
import { useEventBus } from '@byted/hooks';
import useElementRef from './hooks/useElementRef';
import useEditorRef from './hooks/useEditorRef';
import BottomRight from './views/BottomRight';
import useGotoStop from './hooks/useGotoStop';
import useRikoLog from './hooks/useRikoLog';
import usePlayer from './hooks/usePlayer';
import Toolbar3D from './views/Toolbar3D';
import useStore1 from './hooks/useStore';
import TimeLine from './views/Timeline';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { ONBOARD_STEP_4 } from '@editor/Editor/OnBoarding/OnBoarding';
import PanoramaEdit from './views/PanoramaEdit';
export * from './hooks/useEditorRef';

export const useForceSceneReload = () => {
  const { trigger: loadScene } = useEventBus('forceSceneReload');
  return loadScene;
};

export default function Preview() {
  const { state, scene } = useStore1();
  const { edit3d } = useEditor('edit3d');
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const containerRef = useElementRef(state);
  const { editorRef, playerSender, editorSender } = useEditorRef(containerRef);
  useSceneStack(scene, state.editor.playing ? playerSender : editorSender);
  useStateStack(state, state.editor.playing ? playerSender : editorSender);
  usePlayer(editorRef, playerSender);
  useRikoLog(playerSender);
  const typeOfPlay = state.settings.typeOfPlay;
  const category = state.settings.category;
  const isVRVideo = typeOfPlay === 3 && category === 3;

  useEventBus('forceSceneReload', () => setForceUpdate(f => f + 1));
  useEventBus('editorSender', action => editorSender.emit(action));

  const visiblePanoramaEdit = useSelector(({ project }: EditorState) => {
    return project.type === 'PanoramaData' && !isVRCaseAndInEdit(project);
  });

  useEffect(() => {
    if (editorRef.current && !state.editor.playing) {
      editorRef.current = editorRef.current.then(async editor => {
        try {
          const state = getState().project;
          const newScene = intoScene(scene);
          await editor.loadScene(newScene);

          editor.editable = state.editor.sceneMode !== 'Product';
          editorSender.emit(changeCanvasScale(state.editor.canvasScale));
          if (state.type === 'Project') {
            editorSender.emit(setSettings({ ...state.settings, ...getProjectHeight(state) }));
          } else {
            editorSender.emit(setSettings({ ...state.settings, ...getProjectHeight(state), bgImage: '', bgMusic: '' }));
          }
          const { nodeIds, scriptIds } = getSelectedIds(scene.editor.selected);
          if (scriptIds.length) {
            dispatch(selectScript(scriptIds));
          } else if (nodeIds.length) {
            dispatch(selectNode(nodeIds));
          }
        } catch (e) {
          console.error(e);
          message.error(e.message ?? e);
        }
        return editor;
      });
    }
  }, [scene.id, scene.editor.stateId, state.editor.playing, state.type, forceUpdate]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current = editorRef.current.then(editor => {
        editor.editable = state.editor.sceneMode !== 'Product';
        return editor;
      });
    }
  }, [state.editor.sceneMode]);

  useGotoStop(scene, editorRef, state.editor.playing, async editor => {
    dispatch(
      changeEditor(
        scene.id,
        { capture: await editor.capture(scene.id, 260, getProjectHeight(state, 260).height) },
        false,
        ActionFlag.SideEffect
      )
    );
  });
  let timeline = state.editor.sceneMode === 'Product' || scene.editor.playable;
  if (isVRCaseAndInEdit(getState().project) && edit3d) timeline = false;
  return (
    <Layout.Content style={{ position: 'relative' }}>
      <div
        id={ONBOARD_STEP_4}
        ref={containerRef}
        style={{ position: 'relative', height: '100%', width: '100%', backgroundColor: 'white' }}
      />
      {state.settings.enabled3d && !scene.editor.playable && <Toolbar3D />}
      <BottomRight
        bottom={timeline ? 74 : 16}
        blueprint={typeOfPlay !== 4 && state.editor.sceneMode !== 'Product' && !isVRVideo}
      />
      {timeline && <TimeLine scene={scene} />}
      {visiblePanoramaEdit && <PanoramaEdit />}
    </Layout.Content>
  );
}
