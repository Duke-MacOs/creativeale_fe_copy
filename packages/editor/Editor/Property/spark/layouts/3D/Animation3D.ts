import { SparkFn } from '../';
import { compPropsGroups, headerGroup } from '../groups';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';

export const Animation3D: SparkFn = (props, envs) => {
  const content = [headerGroup, physicsGroup];
  if (!envs.isRoot) content.push(compPropsGroups);
  return {
    spark: 'grid',
    content: content
      .concat((props, envs) => {
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
