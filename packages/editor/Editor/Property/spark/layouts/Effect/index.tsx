import { IGroupSpark, filterSpark } from '@editor/Editor/Property/cells';
import { headerGroup } from './groups/headerGroup';
import { loopGroup } from './groups/loopGroup';
import { timeGroup } from './groups/timeGroup';
import { SparkFn } from '..';

import effect from './config';

export interface IEffectConfig {
  [key: string]: { groups?: SparkFn[]; specialConfig?: any };
}

export type EffectFn = (...args: [...Parameters<SparkFn>, IEffectConfig?]) => ReturnType<SparkFn>;

export const Effect: SparkFn = (props, envs) => {
  return filterSpark({
    spark: 'value',
    index: 'script',
    content(script) {
      return {
        spark: 'grid',
        content: [headerGroup, loopGroup, timeGroup]
          .concat(effect[script as keyof typeof effect]?.groups ?? [])
          .map(fn => {
            const group = fn(props, envs, effect[script as keyof typeof effect]?.specialConfig) as IGroupSpark;
            return {
              ...group,
              content: {
                spark: 'block',
                status: 'closed',
                content: group.content,
              },
            };
          }),
      };
    },
  });
};
