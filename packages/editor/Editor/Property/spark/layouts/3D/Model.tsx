import { SparkFn } from '..';
import { extraSpark, headerGroup } from '../groups';
import { colliderGroup } from './MeshSprite3D/colliderGroup';
import { physicsGroup } from './MeshSprite3D/physicsGroup';
import { ResourceBox } from '../groups/resourceSpark/ResourceBox';
import { useModel3DEdit } from '@editor/Template/Model3D/hooks';
import { useCurrentNodeId } from '../groups/customGroups/NodeCell';

export const Model: SparkFn = (props, envs) => {
  const content = [extraSpark, headerGroup];
  if (!envs.isRoot) content.push(physicsGroup);

  const resource: SparkFn = () => {
    return {
      spark: 'group',
      label: '资源',
      content: {
        spark: 'block',
        content: {
          spark: 'value',
          index: ['url', '_editor'],
          content([url = '', _editor]) {
            const currentNodeId = useCurrentNodeId();
            const { replaceCarModelInProduct } = useModel3DEdit();
            return {
              spark: 'element',
              content() {
                return (
                  <ResourceBox
                    type="Model"
                    name={_editor?.name}
                    url={url}
                    cover={_editor?.cover}
                    onChange={async ({ url = '', cover, name }) => {
                      await replaceCarModelInProduct(currentNodeId, url, { _editor: { ..._editor, name, cover } });
                    }}
                  />
                );
              },
            };
          },
        },
      },
    };
  };

  return {
    spark: 'grid',
    content: content
      .concat([
        (props, envs) => {
          return {
            spark: 'check',
            index: 'physics',
            check: {
              hidden: physics => ['none', undefined].includes(physics?.type) || envs.isRoot,
            },
            content: colliderGroup(props, envs),
          };
        },
        resource,
      ])
      .map(fn => fn?.(props, envs)),
  };
};
