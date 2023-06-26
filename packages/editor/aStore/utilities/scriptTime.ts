import { INodeState } from '@editor/aStore';

export const maxEndTime = (nodes: INodeState[], recursive = true, endTime = 0): number => {
  return nodes.reduce((endTime, { scripts, nodes }) => {
    for (const { time = 0, enabled = true, duration = 0 } of scripts) {
      if (enabled) {
        endTime = Math.max(endTime, time + duration);
      }
    }
    return recursive ? maxEndTime(nodes, recursive, endTime) : endTime;
  }, endTime);
};

export const minStartTime = (nodes: INodeState[], recursive = true, startTime = Number.MAX_SAFE_INTEGER): number => {
  return (
    nodes.reduce((startTime, { scripts, nodes }) => {
      for (const { time } of scripts) {
        startTime = Math.min(startTime, time);
      }
      return recursive ? minStartTime(nodes, recursive, startTime) : startTime;
    }, startTime) % Number.MAX_SAFE_INTEGER
  );
};
