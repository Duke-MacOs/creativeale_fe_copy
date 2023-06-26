import { SparkFn } from '..';
import { headerGroup } from '../groups';
import { modelGroup } from './MeshSprite3D/model';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';
import { materialsGroup } from './Materials';

export const SkinnedMeshSprite3D: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .concat(modelGroup, materialsGroup, physicsGroup, (props, envs) => {
        return {
          spark: 'check',
          index: 'physics',
          check: {
            hidden: physics => ['none', undefined].includes(physics?.type),
          },
          content: colliderGroup(props, envs),
        };
      })
      .map(fn => fn(props, envs)),
  };
};
