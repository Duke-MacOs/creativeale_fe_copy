import { INumberSpark, Spark } from '@editor/Editor/Property/cells';
import { formulaSpark } from '../../../../common/formulaSpark';
import { TARGET_NODE_FILTER_TYPE } from '../../../../constants';
import { NodeCell } from '../../../groups/customGroups/NodeCell';

export { highlight } from './highlight';

export interface IEventDesc {
  name: string;
  label?: React.ReactNode;
  category?: string;
  content?: Spark;
  /** 新建脚本时通过valueSpark从Spark配置静态分析出初始值，某些场合（如无法静态分析数据时）可以使用本字段来添加额外的属性 */
  extraProps?: (envs?: { enableBlueprint?: boolean }) => Partial<RikoScript['props']>;
  /**
   * 检测事件是否缺少关键信息，如果有问题则不会展示下方的描述文案
   */
  checkError?: (props: RikoScript['props'], extra: Record<string, any>) => string | '';
  /**
   * 描述文案
   */
  Summary?: React.VoidFunctionComponent<RikoScript>;
  /**
   * 检测是否引用当前选中的节点
   */
  checkRef?: (props: RikoScript['props'], nodeIds: number[]) => boolean;
  /** 教程链接，为空时跳转智能客服 */
  link?: string;
}

export const radius_SPARK: Spark = {
  index: 'radius',
  spark: 'number',
  label: '半径',
  defaultValue: 10,
  tooltip: '半径',
  max: 99999,
};
export const radiusSpark = formulaSpark(radius_SPARK);

export const width_SPARK: Spark = {
  index: 'width',
  spark: 'number',
  label: '宽度',
  defaultValue: 0,
  tooltip: '宽度',
};
export const widthSpark = formulaSpark(width_SPARK);

export const height_SPARK: Spark = {
  index: 'height',
  spark: 'number',
  label: '高度',
  defaultValue: 0,
  tooltip: '高度',
};
export const heightSpark = formulaSpark(height_SPARK);

export const time_SPARK: INumberSpark = {
  spark: 'number',
  index: 'time',
  label: '延迟开始',
  tooltip: '事件延迟开始时间',
  defaultValue: 0,
  required: true,
  precision: 2,
  ratio: -1000,
  unit: 's',
  step: 10,
  min: 0,
};

export const nodeId_SPARK: Spark = {
  spark: 'value',
  index: 'nodeId',
  content(value, onChange) {
    return {
      spark: 'element',
      content: () => <NodeCell value={value} onChange={onChange} label="目标节点" />,
    };
  },
};

export const targetId_SPARK: Spark = {
  spark: 'value',
  index: 'targetId',
  content(value, onChange) {
    return {
      spark: 'element',
      content: () => <NodeCell value={value} onChange={onChange} label="目标节点" />,
    };
  },
};

export const duration_SPARK: Spark = {
  spark: 'number',
  index: 'duration',
  label: '持续时长',
  tooltip: '持续时长',
  defaultValue: 1000,
  required: true,
  ratio: -1000,
  unit: 's',
  step: 10,
  min: 0,
  precision: 2,
};

export const x_SPARK: Spark = {
  index: 'x',
  spark: 'number',
  label: 'X',
  tooltip: 'X 轴坐标',
  defaultValue: 0,
  required: true,
};
export const xSpark = formulaSpark(x_SPARK);

export const y_SPARK: Spark = {
  index: 'y',
  spark: 'number',
  label: 'Y',
  tooltip: 'Y 轴坐标',
  defaultValue: 0,
  required: true,
};
export const ySpark = formulaSpark(y_SPARK);

export const scaleX_SPARK: INumberSpark = {
  index: 'scaleX',
  spark: 'number',
  label: '水平缩放',
  defaultValue: 1,
  step: 0.1,
  tooltip: '水平缩放的倍数',
  required: true,
};
export const scaleXSpark = formulaSpark(scaleX_SPARK);

export const scaleY_SPARK: INumberSpark = {
  index: 'scaleY',
  spark: 'number',
  label: '垂直缩放',
  defaultValue: 1,
  step: 0.1,
  tooltip: '垂直缩放的倍数',
  required: true,
};
export const scaleYSpark = formulaSpark(scaleY_SPARK);

export const targetNodeFilterType_SPARK: Spark = {
  spark: 'select',
  index: 'targetNodeFilterType',
  defaultValue: 'self',
  label: '发送对象',
  tooltip: '要把事件发送给哪些节点: 本身，所有的子节点，所有的父节点',
  options: TARGET_NODE_FILTER_TYPE,
};
