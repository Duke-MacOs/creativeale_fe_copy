import { SparkFn } from '../..';
import { headerGroup, extraSpark } from '../../groups';
import { modelGroup } from './model';
import { colliderGroup } from './colliderGroup';
import { physicsGroup } from './physicsGroup';
import { materialsGroup } from '../Materials';

export const MeshSprite3D: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark, headerGroup]
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
