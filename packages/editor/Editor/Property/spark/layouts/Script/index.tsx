import type { SparkFn } from '..';
import { scriptGroup } from './Scripts';
import { extraSpark } from '../groups';
import { eventGroup } from './Event';

export const Script: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [extraSpark(props, envs), scriptGroup(props, envs), eventGroup(props, envs)],
  };
};
