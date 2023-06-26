import { useMemo } from 'react';
import groupBy from 'lodash/groupBy';
import { getScene, isAnimation, SCALE } from '@editor/utils';
import { INodeState } from '@editor/aStore';
import { shallowEqual, useSelector } from 'react-redux';
const SCALE_TIMES = 2;
const sorting = (a: number, b: number) => (Math.abs(b) > Math.abs(a) ? b : a);
export default ({ id, scripts }: INodeState, scale: number, count: number) => {
  const { resourceDeleted, isAnimationNode } = useSelector(({ project }: EditorState) => {
    const {
      props: { [id]: props },
    } = getScene(project);
    let resourceDeleted = false;
    switch (props.type) {
      case 'Video':
      case 'Sound': {
        resourceDeleted = !props.url;
        break;
      }
    }

    return {
      resourceDeleted,
      isAnimationNode: isAnimation(props.type),
    };
  }, shallowEqual);
  return useMemo(() => {
    if (resourceDeleted) {
      // 资源 URL 删除后隐藏动画和控制器
      // eslint-disable-next-line react-hooks/exhaustive-deps
      scripts = scripts.filter(({ type }) => type !== 'Controller');
    }
    if (isAnimationNode) {
      scripts = scripts.filter(({ type }) => type !== 'Blueprint');
    }
    const timeLimit = scale * count;
    let shadowedId = -1;
    const loopScripts = scripts
      .filter(({ loop, duration }) => loop && duration)
      .reduce((scripts, script) => {
        let { loopTimes = -1 } = script;
        let intervalId = script.id;
        while (true) {
          const { time, duration = 0, loopInterval = 0 } = script;
          const nextTime = time + duration + loopInterval;
          if (time < nextTime && nextTime < timeLimit && (loopTimes <= -1 || loopTimes-- > 1)) {
            script = {
              ...script,
              time: nextTime,
              id: shadowedId--,
              intervalId,
            };
            intervalId = 0;
            scripts.push(script);
          } else {
            break;
          }
        }
        return scripts;
      }, [] as typeof scripts);
    const sortedScripts = loopScripts.concat(
      scripts.sort(({ time: t1, duration: d1 = 0 }, { time: t2, duration: d2 = 0 }) => sorting(t1 - t2, d2 - d1))
    );
    const scriptGroups = Object.values(
      groupBy(
        sortedScripts,
        ({ time, type, duration = 0, script }) =>
          `${type === 'Script'}:${Math.floor(
            script === 'Script' ? time / scale : time / scale / SCALE_TIMES
          )}:${Math.floor(duration / scale / SCALE_TIMES)}`
      )
    );
    const edges = Array.from(
      sortedScripts.reduce((edges, { time, duration = 0 }) => edges.add(time).add(time + duration), new Set<number>())
    ).map(edge => SCALE.ms2px(edge, scale));
    return {
      scriptGroups,
      edges,
    };
  }, [scripts, scale, count, resourceDeleted]);
};
