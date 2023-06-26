import { useCallback, useState } from 'react';
import { useStore } from 'react-redux';
import { getScene, intoNodes, memoPrev, SCALE } from '@editor/utils';
import { INodeState, useEmitter } from '@editor/aStore';
import { INodeData, IScriptData } from '@byted/riko';

const mapCount = <T>(map: Map<T, number>, item: T) => map.set(item, (map.get(item) ?? 0) + 1);

const reduceNodes = <T>(
  nodes: INodeState[],
  reduce: (result: T, node: INodeState, index: number, totalIndex: number) => T,
  initial: T,
  totalIndex = { current: 0 }
): T =>
  nodes.reduce((result, node, index) => {
    const newResult = reduce(result, node, index, totalIndex.current++);
    return node.editor?.isCollapsed ? newResult : reduceNodes(node.nodes, reduce, newResult, totalIndex);
  }, initial);

const getAllEdges = memoPrev((project: EditorState['project']) => {
  const {
    editor: { count },
  } = project;
  const {
    nodes,
    props,
    editor: { scale, moment, selected },
  } = getScene(project);
  const timeLimit = scale * count;
  const nodeData = intoNodes(nodes, props);
  const getNode = (nodes: INodeData[], id: number): INodeData | undefined => {
    const list: INodeData[] = [];
    const flat = (nodes: INodeData[], list: INodeData[]) => {
      nodes.forEach(node => {
        list.push(node);
        node.nodes && flat(node.nodes, list);
      });
    };
    flat(nodes, list);
    return list.find(i => i.id === id);
  };
  return Array.from(
    reduceNodes(
      nodes.map((node: any) => {
        const stateId = node.editor?.stateId;
        return stateId
          ? {
              ...node,
              nodes: node.nodes.map((i: any) => {
                const state = getNode(nodeData, i.id)?.state as any;
                return {
                  ...i,
                  scripts: state?.[stateId]?.scripts?.map((s: any) => node.props[s.id]).filter((n: any) => n) ?? [],
                };
              }),
            }
          : node;
      }),
      (map, { id: nodeId, scripts }) =>
        scripts.reduce((map, { id, time, duration = 0, loopInterval = 0, loop, loopTimes = 0 }) => {
          while (time < timeLimit) {
            mapCount(map, SCALE.ms2px(time, scale));
            if (duration) {
              mapCount(map, SCALE.ms2px(time + duration, scale));
            }
            if (duration + loopInterval > 0 && loop && (loopTimes === -1 || --loopTimes > 0)) {
              time += duration + loopInterval;
            } else {
              break;
            }
          }
          if (nodeId in selected) {
            for (const line of jumpLines((props[id]?.scripts as any) || [])) {
              mapCount(map, SCALE.ms2px(line, scale));
            }
          }
          return map;
        }, map),
      new Map<number, number>([[SCALE.ms2px(moment, scale), 1]])
    )
  );
});

const jumpLines = (scripts: IScriptData[], lines: number[] = []): number[] => {
  return scripts.reduce((lines, { props: { script, startTime, stopTime, scripts } }) => {
    if (script === 'GotoAndPlay') {
      lines.push((startTime as number) || 0);
    } else if (script === 'GotoAndStop') {
      lines.push((stopTime as number) || 0);
    } else if (script === 'Conditions') {
      jumpLines((scripts as any) || [], lines);
    }
    return lines;
  }, lines);
};

const getDistance = (allEdges: [number, number][], edges: number[], delta: number): [number[], number] => {
  const next = edges.reduce((distance, edge) => {
    allEdges.forEach(([refline, count]) => {
      if (edge === refline && count === 1) {
        distance.push(Number.MAX_SAFE_INTEGER);
      } else {
        distance.push(refline - edge - delta);
      }
    });
    return distance;
  }, [] as number[]);
  if (!next.length) {
    return [[], 0];
  }
  const [distance, indices] = next.reduce(
    ([prevDistance, prevIndices], distance, index) => {
      if (Math.abs(distance) < Math.abs(prevDistance)) {
        return [distance, [index]];
      } else if (Math.abs(distance) > Math.abs(prevDistance) || distance !== prevDistance) {
        return [prevDistance, prevIndices];
      }
      return [distance, [...prevIndices, index]];
    },
    [next[0], [0]]
  );
  if (Math.abs(distance) < SCALE.LENGTH) {
    const reflines = indices
      .map(index => allEdges[index % allEdges.length][0])
      .filter((refline, index, array) => array.indexOf(refline) === index);
    return [reflines, distance];
  }
  return [[], 0];
};

export const useGetReflines = () => {
  const [reflines, setReflines] = useState<number[]>([]);
  useEmitter('UseReflines', setReflines);
  return reflines;
};

export const useSetReflines = () => {
  const { getState } = useStore<EditorState>();
  const onEmit = useEmitter('UseReflines');
  return useCallback(
    (edges: number[], delta: number): number => {
      const allEdges = getAllEdges(getState().project);
      const [reflines, distance] = getDistance(allEdges, edges, delta);
      onEmit(reflines);
      return distance;
    },
    [getState, onEmit]
  );
};

export const useGetBins = () => {
  const { getState } = useStore<EditorState>();
  return useCallback(() => {
    const {
      nodes,
      editor: { scale },
    } = getScene(getState().project);
    return Array.from(
      reduceNodes(
        nodes,
        (set, { scripts }) => scripts.reduce((set, { duration = 0 }) => (duration > 0 ? set.add(duration) : set), set),
        new Set<number>()
      )
    ).map(duration => SCALE.ms2px(duration, scale));
  }, [getState]);
};
