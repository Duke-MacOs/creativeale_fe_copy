import { ICustomScriptState } from '@editor/aStore';
import { intoScene } from '@editor/utils';
import { uniq } from 'lodash';
import { createSelector } from 'reselect';
import { useSelector, shallowEqual } from 'react-redux';
import { collectScripts } from '../../utils/collectRikoHook';
import { syncGetCustomScriptDeps } from '../../utils/getCustomScriptDeps';

/**
 * 获取项目中直接被引用的脚本orderId、以及代码中import引用的脚本orderId
 * @returns
 */
export function useInUsedOrderIds() {
  return useSelector((state: EditorState) => {
    return queryInUsedOrderIds(state);
  }, shallowEqual);
}

const queryInUsedOrderIds = createSelector(
  ({ project }: EditorState) => {
    while (project.editor.prevState) {
      project = project.editor.prevState;
    }

    return project.customScripts;
  },
  ({ project }: EditorState) => {
    return getExplicitOrderIds(project.scenes);
  },
  (customScripts, orderIds) => {
    const map = getCustomScriptsMap(customScripts.filter(script => script.status !== 1));
    return uniq([...orderIds, ...Array.from(getImplicitOrderIds(orderIds, map)).flat()]);
  },
  {
    memoizeOptions: {
      equalityCheck: shallowEqual,
    },
  }
);

/**
 * 获取项目中直接引用的脚本
 * @param project
 * @returns
 */
function getExplicitOrderIds(scenes: EditorState['project']['scenes']): number[] {
  return uniq(
    scenes
      .map(scene =>
        Array.from(
          collectScripts(intoScene(scene), function* (script) {
            if (typeof script.props.url === 'number') {
              yield script.props.url;
            }
          })
        )
      )
      .flat()
  );
}

/**
 * 获取项目中通过代码间接引用的脚本
 * @param orderIds
 * @param map
 */
function* getImplicitOrderIds(orderIds: number[], map: Map<number, number[]>): Generator<number[]> {
  for (const orderId of orderIds) {
    if (map.has(orderId)) {
      const ids = map.get(orderId);
      if (ids) {
        yield ids;
        yield* getImplicitOrderIds(ids, map);
      }
    }
  }
}

/**
 * 获取项目自定义脚本依赖图
 * @param customScripts
 * @returns
 */
function getCustomScriptsMap(customScripts: ICustomScriptState[]): Map<number, number[]> {
  const map = new Map();
  for (const { orderId, ideCode } of customScripts) {
    syncGetCustomScriptDeps(ideCode, customScripts, ({ orderId: targetOrderId }) => {
      map.set(orderId, map.has(orderId) ? [...map.get(orderId), targetOrderId] : [targetOrderId]);
    });
  }

  return map;
}
