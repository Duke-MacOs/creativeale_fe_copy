import { Node } from 'react-flow-renderer';
import { Signal } from '../../types';

/**
 * 获取蓝图节点的所有输入、输出信号
 * @param node
 * @returns
 */
export function getSignals(node: Node<RikoScript>) {
  const {
    data: { props, editor: { inputs = [], outputs = [] } = {} },
  } = node;
  const { inputs: $inputs, outputs: $outputs } = getRikoSignals(props);
  return {
    inputs: [...inputs, ...$inputs],
    outputs: [...outputs, ...$outputs],
  };
}

/**
 * 获取Riko.useInput或Riko.useOutput创建的输入和输出
 */
export function getRikoSignals<T extends any[] = NonNullable<NonNullable<RikoScript['editor']>['inputs']>>(
  props: RikoScript['props']
) {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith('$'))
      .reduce(
        (acc, [key, hook]: [string, any]) => {
          const { callee, name: label, tooltip } = hook;
          if (callee === 'Riko.useInput') {
            acc[0][1].push({ key: key.replace(/^\$/, ''), label, tooltip });
          }
          if (callee === 'Riko.useInputs') {
            acc[0][1].push(
              ...(hook.value || []).filter((key: string) => !!key).map((key: string) => ({ key, label: key }))
            );
          }
          if (callee === 'Riko.useOutput') {
            acc[1][1].push({ key: key.replace(/^\$/, ''), label, tooltip });
          }
          if (callee === 'Riko.useOutputs') {
            acc[1][1].push(
              ...(hook.value || []).filter((key: string) => !!key).map((key: string) => ({ key, label: key }))
            );
          }

          return acc;
        },
        [
          ['inputs', [] as unknown as T],
          ['outputs', [] as unknown as T],
        ]
      )
  ) as {
    inputs: T;
    outputs: T;
  };
}

/**
 * 新的信号key值
 *
 * 1、2、3 -> 4
 *
 * 1、3、4 -> 2
 *
 * @param signals
 * @returns
 */
export function newSignalIndex(signals: Signal[], current = 1) {
  const list = signals
    .reduce((list, signal) => {
      if (isCustomSignal(signal)) {
        return list.concat(extractCustomSignal(signal));
      }

      return list;
    }, [] as number[])
    .sort((a, b) => a - b);
  for (const i of list) {
    if (current === i) {
      current++;
      continue;
    }
    break;
  }
  return current;
}

export function createCustomSignal(prefix: `$${'inputs' | 'outputs'}`, index: number) {
  return `${prefix}_${index}`;
}

const regExp = /\$(?:inputs|outputs)_(\d)+$/;
/**
 * 蓝图的输入信号key和输出信号key不能相同，所以自定义信号需要加上前缀进行区分
 * @param signal
 * @returns
 */
export function isCustomSignal({ key }: Signal) {
  return (
    regExp.test(key) ||
    // 暂时兼容老数据，后续移除
    isFinite(Number(key))
  );
}

/**
 * 从自定义信号中提取数值，如$inputs_2提取出2
 */
function extractCustomSignal(signal: Signal) {
  const [_, num] = regExp.exec(signal.key) ?? [];
  if (num === undefined) {
    throw new Error(`非自定义信号${signal.key}`);
  }
  return Number(num);
}
