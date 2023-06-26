import { useCallback } from 'react';
import { changeProps, groupActions } from '@editor/aStore';
import { SCALE } from '@editor/utils';
import { useActivateMovement } from './useMovement';
import { useGetBins } from '../hooks/useReflines';

export function useMoveScripts(setReflines: (edges: number[], delta: number) => number) {
  return useActivateMovement(
    'Scripts',
    useCallback(
      ({ scriptIds, props, scale, setStartEndTime }) => {
        const startTime =
          scriptIds.reduce((startTime, scriptId) => {
            const { time } = props[scriptId];
            return Math.min(startTime, time as number);
          }, Number.MAX_SAFE_INTEGER) % Number.MAX_SAFE_INTEGER;
        const edges = scriptIds
          .reduce((edges, scriptId) => {
            const { time, duration } = props[scriptId] as Record<string, number>;
            edges.push(time);
            if (duration) {
              edges.push(time + duration);
            }
            return edges;
          }, [] as number[])
          .map(time => SCALE.ms2px(time, scale));
        setStartEndTime(startTime);
        return {
          getAlignment(movement) {
            return setReflines(edges, movement);
          },
          onFinish(dispatch, deltaTime) {
            setReflines([], 0);
            if (deltaTime) {
              dispatch(
                groupActions(
                  scriptIds.map(scriptId =>
                    changeProps([scriptId], {
                      time: Math.max((props[scriptId].time as number) + deltaTime, 0),
                    })
                  )
                )
              );
            }
          },
        };
      },
      [setReflines]
    )
  );
}

export function useMoveScriptsAround(type: 'LeftOfScripts' | 'RightOfScripts') {
  const getBins = useGetBins();
  return useActivateMovement(
    type,
    useCallback(
      ({ scriptIds, props, scale, setStartEndTime }) => {
        let edges = [] as number[];
        const widths = [] as number[];
        for (const scriptId of scriptIds) {
          const { time, duration = 0 } = props[scriptId] as Record<string, number>;
          edges.push(time);
          if (duration) {
            edges.push(time + duration);
          }
          widths.push(duration);
        }
        edges = edges.map(time => SCALE.ms2px(time, scale));
        const widthsPX = widths.map(width => SCALE.ms2px(width, scale));
        const minWidth = widths.reduce((prev, cur) => Math.min(prev, cur));
        if (type === 'LeftOfScripts') {
          const startTime =
            scriptIds.reduce((startTime, scriptId) => {
              const { time } = props[scriptId];
              return Math.min(startTime, time as number);
            }, Number.MAX_SAFE_INTEGER) % Number.MAX_SAFE_INTEGER;
          setStartEndTime(startTime, minWidth - 2 * scale);
        } else {
          setStartEndTime(minWidth - 2 * scale);
        }
        return {
          getAlignment(movement) {
            if (type === 'LeftOfScripts') {
              movement = -movement;
            }
            const bin = getBins()
              .map(bin =>
                widthsPX.includes(bin) ? Number.MAX_SAFE_INTEGER : widthsPX.map(width => bin - (width + movement))
              )
              .flat(2)
              .reduce((bin, delta) => (Math.abs(delta) < Math.abs(bin) ? delta : bin), 0);
            if (Math.abs(bin) < SCALE.LENGTH) {
              return type === 'LeftOfScripts' ? -bin : bin;
            } else {
              return 0;
            }
          },
          onFinish(dispatch, deltaTime) {
            if (deltaTime) {
              dispatch(
                groupActions(
                  scriptIds.map(scriptId =>
                    changeProps(
                      [scriptId],
                      type === 'LeftOfScripts'
                        ? {
                            time: Math.max((props[scriptId].time as number) + deltaTime, 0),
                            duration: Math.max((props[scriptId].duration as number) - deltaTime, 0),
                          }
                        : {
                            duration: Math.max((props[scriptId].duration as number) + deltaTime, 0),
                          }
                    )
                  )
                )
              );
            }
          },
        };
      },
      [type, getBins]
    )
  );
}
