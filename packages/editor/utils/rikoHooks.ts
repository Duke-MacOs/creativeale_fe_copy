import { mapValues } from 'lodash';

export const intoRikoHook = (hook: RikoHook, value: any, key = 'value'): RikoHook => {
  switch (hook.callee) {
    case 'Riko.useObject':
    case 'object':
      return {
        ...hook,
        value: Object.fromEntries(
          Object.entries(hook.value ?? hook.default).map(([k, hook]) => [
            k,
            intoRikoHook(hook as RikoHook, value?.[k], key),
          ])
        ),
      };
    default:
      return { ...hook, [key]: value };
  }
};

export const fromRikoHook = (hook: RikoHook): any => {
  switch (hook.callee) {
    case 'Riko.useObject':
    case 'object':
      return mapValues(hook.value ?? hook.default, value => fromRikoHook(value));
    default:
      return hook.value ?? hook.default;
  }
};

export const mapResNode = (hook: RikoHook, map: (node: RikoNode) => RikoNode): RikoHook => {
  switch (hook.callee) {
    case 'Riko.useResNode':
      const value = map(hook.value);
      if (value === hook.value) {
        return hook;
      }
      return { ...hook, value };
    case 'Riko.useObject':
    case 'object':
      return {
        ...hook,
        value: mapValues(hook.value ?? hook.default, value => mapResNode(value, map)),
      };
    case 'Riko.useArray':
      return {
        ...hook,
        value: hook.value.map((value: any) => fromRikoHook(mapResNode(intoRikoHook(hook.defaultItem!, value), map))),
      };
    default:
      return hook;
  }
};

const RikoCallee = [
  'Riko.useSymbol',
  'Riko.useString',
  'Riko.useNumber',
  'Riko.useBoolean',
  'Riko.useColor',
  'Riko.useSelect',
  'Riko.useMode',
  'Riko.useResNode',
  'Riko.useRes',
  'Riko.useNode',
  'Riko.useSlider',
  'Riko.useObject',
  'Riko.useArray',
  'Riko.useEase',
  'Riko.useEvent',
  'Riko.useEffect',
  'Riko.useVector',
  'Riko.useMaterial',
  'Riko.useInput',
  'Riko.useInputs',
  'Riko.useOutput',
  'Riko.useOutputs',
  'boolean',
  'object',
  'string',
  'number',
] as const;

export function isRikoHook(hook: any): hook is RikoHook {
  return RikoCallee.includes(hook.callee);
}

export type RikoHook = {
  callee: typeof RikoCallee extends readonly (infer T)[] ? T | never : never;
  orderIndex: number;
  /** 属性面板内显示的名字，如果不设置则默认为属性名称 */
  name: string;
  /** name显示宽度 */
  width?: number;
  /** 默认值，默认为 `""` */
  default: any;
  value?: any;
  /** 鼠标提示信息 */
  tooltip?: string;
  defaultItem?: RikoHook;
  /** 是否必填 */
  required?: boolean;
  defaultExpanded?: boolean;
  /** 最大值 */
  max?: number;
  unit?: string;
  type?: string;
  accept?: string;
  /** 最小值 */
  min?: number;
  step?: number;
  concise?: boolean;
  precision?: number;
  cover?: string;
  /** 描述事件的触发条件的文案 */
  desc?: string;
  mode?: any[];
  ratio?: number;
  /** 最多获取多少个数据，默认无限多 */
  maxLength?: number;
  /** 最少获取多少个数据 */
  minLength?: number;
  /** 提供可描述输入字段预期值的提示信息 */
  placeholder?: string;
  /** 字段在排版时占多少列，每行分为24列，12列即为半行，默认24占一整行 */
  colSpan?: number;
  options?: Array<{ label: string; value: string | number }>;
  /** 动态节点初始横坐标偏移量，仅在useArray中生效 */
  offsetX?: number;
  /** 动态节点初始纵坐标偏移量，仅在useArray中生效 */
  offsetY?: number;
  isAnchor?: boolean;
  _editor?: Record<string, any>;
  /** useVector 内部label */
  labels?: string[];
  /**
   * useSymbol类别，使用时只展示同类别的symbol
   */
  category?: string;
  hidden?: boolean | `eval:${string}`;
};
