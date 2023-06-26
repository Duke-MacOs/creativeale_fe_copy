import { toColorful } from '@shared/utils';
import { ISceneState } from '@editor/aStore';

export function* checkSceneDoubleVideo({ id, props, name, editor }: ISceneState) {
  if (editor.playable) {
    return;
  }
  if (
    Object.values(props)
      .map(({ type }) => Number(type === 'Video'))
      .reduce((a, b) => a + b, 0) > 1
  ) {
    yield {
      type: `DoubleVideo:${id}`,
      message: toColorful({ text: name }, '内建议只使用一个视频，否则可能导致加载率偏低'),
      warning: '同一场景内建议只使用一个视频，否则可能导致加载率偏低',
    };
  }
}
