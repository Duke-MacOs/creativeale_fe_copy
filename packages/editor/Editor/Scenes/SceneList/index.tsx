import { ISceneState } from '@editor/aStore';
import React, { memo } from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import SceneItem, { SceneItemProps, StaticSceneItem } from '../SceneItem';

export interface SceneListProps extends Pick<SceneItemProps, 'sceneDisabled'> {
  scenes: ISceneState[];
  selectedId: number;
}

const SceneList = ({ scenes, sceneDisabled, selectedId }: SceneListProps) => {
  return (
    <div className="scene-list">
      {scenes
        .map((scene, index) => ({ scene, index }))
        .filter(({ scene }) => scene.type === 'Scene')
        .map(({ scene, index }, sceneIndex) => {
          const Item = sceneIndex === 0 ? StaticSceneItem : SceneItem;
          return (
            <Item
              index={index}
              key={scene.id}
              sceneId={scene.id}
              orderId={scene.orderId}
              sceneIndex={sceneIndex}
              sceneDisabled={sceneDisabled}
              selected={scene.id === selectedId}
            />
          );
        })}
    </div>
  );
};

export default memo(SortableContainer(SceneList));
