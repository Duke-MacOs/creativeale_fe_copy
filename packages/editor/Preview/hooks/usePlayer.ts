/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useStore } from 'react-redux';
import { throttle } from 'lodash';
import { getScene } from '@editor/utils';
import { Action, Editor, PlayerAction, PlayerActionType } from '@byted/riko';
import { changeEditor, changeMoment, changeProps } from '../../aStore';

const changeTime = throttle((time: number) => changeMoment(time, true), 16);

export default (editorRef: React.RefObject<Promise<Editor>>, playerSender: any) => {
  const { subscribe, getState, dispatch } = useStore<EditorState, EditorAction>();
  useEffect(() => {
    const unsubscribe = editorRef.current?.then(editor => {
      let playerSending = () => undefined as void;
      let nextState = getState().project;
      return subscribe(() => {
        const {
          editor: { playing, playRate, soundVolume },
        } = nextState;
        nextState = getState().project;
        if (nextState.editor.playRate !== playRate || nextState.editor.soundVolume !== soundVolume) {
          if (nextState.editor.playing) {
            playerSender.emit({
              type: PlayerActionType.RuntimeSettings,
              rate: nextState.editor.playRate,
              soundVolume: nextState.editor.soundVolume / 100,
            });
          }
        }
        if (nextState.editor.playing !== playing) {
          if (!playing) {
            const scene = getScene(nextState);
            playerSending = playerSender.on((action: PlayerAction | Action) => {
              switch (action.type) {
                case PlayerActionType.SetTime:
                  return dispatch(changeTime(action.time) as any);
                case PlayerActionType.ActivateNode:
                  return dispatch(changeProps([action.nodeId], { enabled: true } as any, { playing: true }));
                case PlayerActionType.DeactivateNode:
                  return dispatch(changeProps([action.nodeId], { enabled: false } as any, { playing: true }));
                case PlayerActionType.ChangeScene:
                  const scene = getState().project.scenes.find(
                    scene => scene.id === action.sceneId || scene.orderId === action.sceneId
                  );
                  if (scene) {
                    return dispatch(changeEditor(0, { selectedSceneId: scene.id }, true));
                  } else {
                    return console.log('Unknown sceneId', action);
                  }
                case PlayerActionType.NodeProperties:
                  if (action.properties?.props) {
                    const { id, props } = action.properties;
                    return dispatch(changeProps([id], props, { playing: true }));
                  }
                  return;
                default:
                  return dispatch({ ...action, playing: true } as any);
              }
            });
            editor.play(
              scene.editor.moment,
              nextState.editor.playRate,
              nextState.editor.soundVolume / 100,
              scene.orderId
            );
          } else if (!nextState.editor.playing) {
            playerSending();
            editor.stop();
          } else if (nextState.editor.playing % 2) {
            playerSender.emit({
              type: PlayerActionType.Resume,
            });
          } else {
            playerSender.emit({
              type: PlayerActionType.Pause,
            });
          }
        }
      });
    });
    return () => {
      unsubscribe?.then(unsubscribe => unsubscribe());
    };
  }, [Boolean(editorRef.current)]);
};
