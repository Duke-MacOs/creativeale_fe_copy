import { SparkFn } from '../';
import { headerGroup } from '../groups';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';

export const Sprite3D: SparkFn = (props, envs) => {
  const content = [headerGroup];
  if (!envs.isRoot) content.push(physicsGroup);
  return {
    spark: 'grid',
    content: content
      .concat((props, envs) => {
        return {
          spark: 'check',
          index: 'physics',
          check: {
            hidden: physics => ['none', undefined].includes(physics?.type) || envs.isRoot,
          },
          content: colliderGroup(props, envs),
        };
      })
      .map(fn => fn(props, envs)),
  };
};
