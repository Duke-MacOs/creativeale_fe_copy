import { toColorful } from '@shared/utils';
import { ISceneState } from '@editor/aStore';
import { findById } from '@editor/utils';

export function* checkSceneLoopVideo({ props, nodes, name }: ISceneState) {
  for (const [key, prop] of Object.entries(props)) {
    if (prop.type === 'Video') {
      const [{ scripts }] = findById(nodes, Number(key));
      for (const { id } of scripts.filter(({ type }) => type === 'Controller')) {
        if ((props[id].duration ?? 0) > 15 * 1000) {
          yield {
            type: `LongController:${id}`,
            message: toColorful(
              `您在“`,
              { text: name },
              `”中使用的“`,
              { text: prop.name! },
              `”，视频长度超过15秒，建议视频长度在1s-15s，以免影响加载速度`
            ),
            warning: '建议视频长度小于15秒，以免影响加载速度',
          };
        }
        if ((props[id].duration ?? 0) < 1 * 1000) {
          yield {
            type: `ShortController:${id}`,
            message: toColorful(
              `您在“`,
              { text: name },
              `”中使用的“`,
              { text: prop.name! },
              `”，视频长度不足1秒，建议视频长度在1s-15s，以免影响作品体验`
            ),
            warning: '建议视频长度大于1秒，以免影响作品体验',
          };
        }
      }
    }
  }
}
