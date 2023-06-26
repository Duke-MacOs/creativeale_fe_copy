import { updateLayerCollisions } from '@editor/aStore/project/stateReducer/updateLayerCollisions';
import { updateLayerName } from '@editor/aStore/project/stateReducer/updateLayerName';
import { deleteLayerCollisions } from '@editor/aStore/project/stateReducer/deleteLayerCollisions';
import { deleteLayerName } from '@editor/aStore/project/stateReducer/deleteLayerName';
import { useStore } from 'react-redux';
import { layerCollisionInUsed } from '@editor/utils';
import { message } from 'antd';

const layerCollisions = {
  0: [0],
  1: [1],
  2: [2],
  3: [3],
  4: [4],
  5: [5],
};
const layerCollisionName = [
  { name: '默认', key: '0' },
  { name: '平地', key: '1' },
  { name: '玩家', key: '2' },
  { name: '敌人', key: '3' },
  { name: '金币', key: '4' },
  { name: '子弹', key: '5' },
];

export const useLayer = () => {
  const { dispatch, getState } = useStore();

  const resetLayer = () => {
    Object.entries(layerCollisions).forEach(([key, value]) => {
      dispatch(updateLayerCollisions(key, value));
    });

    layerCollisionName.forEach((value: { key: string; name: string }, idx: number) => {
      dispatch(updateLayerName(idx, value));
    });
  };

  const initialLayer = () => {
    if (getState().project.settings.layerCollisionName === undefined) {
      Object.entries(layerCollisions).forEach(([key, value]) => {
        dispatch(updateLayerCollisions(key, value));
      });

      layerCollisionName.forEach((value: { key: string; name: string }, idx: number) => {
        dispatch(updateLayerName(idx, value));
      });
    }
  };

  const updateName = (value: { key: string; name: string }, idx: number) => {
    dispatch(updateLayerName(idx, value));
  };

  const updateCollisions = (key: string, value: number[]) => {
    dispatch(updateLayerCollisions(key, value));
  };

  const addCollision = () => {
    const {
      project: {
        settings: { layerCollisionName, layerCollisions },
      },
    } = getState();
    const length = layerCollisionName.length;
    let i = 1;
    while (layerCollisionName.map((i: any) => i.name).includes(`碰撞组${i}`)) {
      i++;
    }
    let key = 0;
    while (Object.keys(layerCollisions).includes(`${key}`)) {
      key++;
    }
    dispatch(updateLayerName(length, { name: `碰撞组${i}`, key: `${key}` }));
    dispatch(updateLayerCollisions(key, [key]));
  };

  const deleteCollision = (key: string) => {
    if (layerCollisionInUsed(getState().project, key)) {
      message.error('碰撞组正在被使用，无法删除');
    } else {
      dispatch(deleteLayerCollisions(key));
      dispatch(deleteLayerName(key));
    }
  };

  return {
    resetLayer,
    initialLayer,
    updateName,
    updateCollisions,
    addCollision,
    deleteCollision,
  };
};
