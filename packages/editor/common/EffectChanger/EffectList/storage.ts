import { isArray } from 'lodash';
export interface EffectItemProps {
  script: string;
  name: string;
  duration: number;
  props?: any;
}

export function removeStorage(key: string) {
  sessionStorage.removeItem(`editor._effectChanger.${key}`);
}

export function setStorage(key: string, effect: Pick<EffectItemProps, 'script' | 'name'>) {
  key = 'editor._effectChanger.' + key;
  let cache: string[] | string | null = sessionStorage.getItem(key);
  const item = `${effect.script}_${effect.name}`;

  if (cache) {
    cache = JSON.parse(cache);

    if (isArray(cache)) {
      const idx = cache.indexOf(item);
      if (idx >= 0) {
        cache.splice(idx, 1);
      }
      if (cache.length === 10) {
        cache.pop();
      }
      cache.unshift(item);
      sessionStorage.setItem(key, JSON.stringify(cache));
    } else {
      sessionStorage.setItem(key, JSON.stringify([item]));
    }
  } else {
    sessionStorage.setItem(key, JSON.stringify([item]));
  }
}

export function getStorage(
  key: string,
  dataList: Array<{ key: string; name: string; list: EffectItemProps[] }>
): EffectItemProps[] {
  key = 'editor._effectChanger.' + key;
  const [defaultRecentGroup, ...restGroup] = dataList;
  let cache: string[] | string | null = sessionStorage.getItem(key);
  if (cache) {
    cache = JSON.parse(cache);

    if (isArray(cache)) {
      const list = [];
      const allEffects: Record<string, EffectItemProps> = {};
      for (const group of restGroup) {
        for (const effect of group.list) {
          allEffects[`${effect.script}_${effect.name}`] = effect;
        }
      }

      for (const cacheItem of cache) {
        if (allEffects[cacheItem]) {
          list.push(allEffects[cacheItem]);
        }
      }

      if (list.length < 10) {
        for (const effect of defaultRecentGroup.list) {
          if (cache.indexOf(`${effect.script}_${effect.name}`) < 0) {
            list.push(effect);
          }
          if (list.length === 10) {
            break;
          }
        }
      }
      return list;
    }
  }
  return dataList[0].list;
}
