import baseEffect from './baseEffect/base.json';
import baseEffect3D from './baseEffect3D/base.json';
import inEffect from './inEffect/in.json';
import loopEffect from './loopEffect/loop.json';
import loopEffect3D from './loopEffect3D/loop.json';
import maskEffect from './maskEffect/mask.json';
import outEffect from './outEffect/out.json';

/**
 * 获取所有动画效果
 * @param map
 */
export function* collectEffect<T>(
  map: (effect: { script: string; name: string; duration: number; props?: Record<string, any> }) => Generator<T>
): Generator<T> {
  for (const { list } of [
    ...baseEffect,
    ...baseEffect3D,
    ...inEffect,
    ...loopEffect,
    ...loopEffect3D,
    ...maskEffect,
    ...outEffect,
  ]) {
    for (const effect of list) {
      yield* map(effect);
    }
  }
}
