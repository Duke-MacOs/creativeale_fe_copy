import React, { useCallback, useRef } from 'react';
import { useSelector, useStore } from 'react-redux';
import { changeCanvasScale, changeEditor, changeMoment, restoreState } from '@editor/aStore';
import { Pause, PlayOne } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { getScene } from '@editor/utils';

const PlayIcon = (props: any) => <PlayOne {...props} theme="filled" />;
export const pauseIcon = <Icon component={Pause as any} />;
export const playIcon = <Icon component={PlayIcon} />;
export const usePlaying = () => {
  const playing = useSelector(({ project }: EditorState) => project.editor.playing);
  const disabled = useSelector(({ project }: EditorState) => !getScene(project).nodes.length);
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const selectedSceneIdRef = useRef<number | null>(null);

  return {
    playing,
    disabled,
    onStopAndReset: useCallback(() => {
      const { playing, prevState } = getState().project.editor;
      if (!playing) {
        dispatch(changeMoment(0));
      } else if (prevState) {
        dispatch(restoreState({ ...prevState, editor: { ...prevState.editor } }));
      }
    }, [dispatch, getState]),
    onPlayOrStop: useCallback(
      (resetMomentIfNeeded = false) => {
        const state = getState().project;
        const {
          settings: { enabled3d },
        } = state;

        if (state.editor.playing) {
          const selectedSceneId = selectedSceneIdRef.current;
          selectedSceneIdRef.current = null;
          dispatch(
            changeEditor(
              0,
              Object.assign(
                { playing: 0, canvasScale: state.editor.prevState?.editor.canvasScale || 1 },
                selectedSceneId && { selectedSceneId }
              )
            )
          );
        } else {
          if (enabled3d) {
            dispatch(changeCanvasScale(1, true));
          }
          selectedSceneIdRef.current = state.editor.selectedSceneId;

          setTimeout(() =>
            dispatch(
              restoreState({
                ...state,
                editor: Object.assign(
                  {
                    ...state.editor,
                    prevState: state,
                    playing: 1,
                  },
                  enabled3d ? { canvasScale: 1 } : {}
                ),
                scenes: state.scenes.map(scene => {
                  const newScene = {
                    ...scene,
                    editor: {
                      ...scene.editor,
                      selected: {},
                    },
                  };
                  if (
                    resetMomentIfNeeded &&
                    scene.id === state.editor.selectedSceneId &&
                    scene.editor.moment >= scene.editor.scale * state.editor.count
                  ) {
                    newScene.editor.moment = 0;
                  }
                  return newScene;
                }),
              })
            )
          );
        }
      },
      [dispatch, getState]
    ),
  };
};
