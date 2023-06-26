import { useEffect } from 'react';
import { useEmitter } from '@editor/aStore';
import { Action, PlayerAction, PlayerActionType } from '@byted/riko';

const useRikoLog = (playerSender: any) => {
  const updateRikoLog = useEmitter('UpdateRikoLog');
  useEffect(() => {
    playerSender.on((action: PlayerAction | Action) => {
      if (action.type === PlayerActionType.Log) {
        updateRikoLog({
          level: action.level,
          message: action.message,
        });
      }
    });
  }, [playerSender, updateRikoLog]);
};

export default useRikoLog;
