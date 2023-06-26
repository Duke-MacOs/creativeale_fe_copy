import { INodeData, IScriptData } from '@byted/riko';
import { intoRikoHook, RikoHook } from '@editor/utils';

/**
 * 获取场景/节点所有用到的的脚本
 */
export function* collectScripts<T>(
  node: INodeData,
  map: (script: IScriptData) => Generator<T>,
  onlyCustomScript = true
): Generator<T> {
  const { nodes = [], scripts = [] } = node;
  yield* collect(scripts);
  for (const node of nodes) {
    yield* collectScripts(node, map, onlyCustomScript);
  }

  function* collect(scripts: IScriptData[] = []): Generator<T> {
    for (const script of scripts) {
      if (onlyCustomScript) {
        if (script.type === 'Script' && script.props.script === 'CustomScript') {
          yield* map(script);
        }
      } else {
        yield* map(script);
      }
      for (const key of ['scripts', 'elseScripts'] as const) {
        yield* collect(script.props[key]);
      }
    }
  }
}

/**
 * 获取指定的脚本数据
 * @param scripts
 * @param map
 */
export function* collectRikoHook<T>(scripts: RikoScript[], map: (hook: RikoHook) => Generator<T>): Generator<T> {
  for (const { props } of scripts) {
    yield* fromProps(
      Object.entries(props)
        .filter(([key]) => key.startsWith('$'))
        .map(([_, hook]) => hook as RikoHook),
      map
    );
  }

  function* fromProps<T>(hooks: RikoHook[], map: (hook: RikoHook) => Generator<T>): Generator<T> {
    for (const hook of hooks) {
      const { callee, value, default: defaultValue, defaultItem } = hook;
      switch (callee) {
        case 'Riko.useObject':
        case 'object': {
          yield* fromProps(Object.values(value ?? defaultValue), map);
          break;
        }

        case 'Riko.useArray': {
          if (defaultItem) {
            yield* fromProps(
              value.map((v: any) => intoRikoHook(defaultItem, v)),
              map
            );
          }
          break;
        }

        default:
          yield* map(hook);
      }
    }
  }
}
