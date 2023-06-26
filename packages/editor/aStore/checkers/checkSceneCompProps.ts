import { toColorful } from '@shared/utils';
import { ISceneState, ICompProp } from '@editor/aStore';
import { findPropById } from '@editor/utils';
import { isEqual } from 'lodash';

export function* checkSceneCompProps({ id, props: sceneProps }: ISceneState) {
  const { name: sceneName = '', compProps = [] } = sceneProps[id];
  for (const { ids, type, name, props, enabled = true } of compProps) {
    if (enabled && ['Sprite', 'Video', 'Sound', 'Script_PlaySound'].includes(type)) {
      const prop = props.find(({ key }) => key === 'url');
      if (prop && prop.default === getPropValue(findPropById(sceneProps, ids[0]), ids.slice(1), 'url')) {
        yield toColorful(`检查到「`, { text: sceneName }, '-', { text: name }, `」未替换素材`);
      }
    }
  }
}

const getPropValue = (props: Record<string, any>, compIds: number[], propKey: string): any => {
  if (!compIds.length) {
    return props[propKey];
  }
  const { compProps } = props;
  for (const { ids, props } of compProps as ICompProp[]) {
    if (isEqual(ids, compIds)) {
      return props.find(({ key }) => key === propKey)?.value;
    }
  }
};
