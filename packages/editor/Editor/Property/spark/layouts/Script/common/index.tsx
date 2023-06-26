import type { Spark } from '../../../../cells';
import { QuestionCircleOutlined } from '@ant-design/icons/lib/icons';
import { useImbot } from '@editor/aStore';
import { Tooltip } from 'antd';
import React from 'react';

export interface IScriptDesc {
  name: string;
  content: (envs: { blueprint?: boolean }) => Spark;
  tooltip?: React.ReactNode;
  extraProps?: (envs?: { enableBlueprint?: boolean }) => Record<string, any>;
  checkError?: (props: RikoScript['props'], extra: Record<string, any>) => string | '';
}

export const once_SPARK: Spark = {
  spark: 'label',
  label: '是否生效一次',
  tooltip: '默认事件可以被多次执行，勾选后，则事件只会被执行一次',
  content: {
    spark: 'boolean',
    index: 'once',
    defaultValue: false,
  },
};

export const continuous_SPARK: Spark = {
  spark: 'label',
  label: '持续触发',
  tooltip: '是否持续触发',
  content: {
    spark: 'boolean',
    index: 'continuous',
    defaultValue: false,
  },
};

export const autoTrigger_SPARK: Spark = {
  spark: 'label',
  label: '自动触发',
  tooltip: '当设备不支持摇一摇时，是否自动触发脚本',
  content: {
    spark: 'boolean',
    index: 'autoTrigger',
    defaultValue: true,
  },
};

export const HelpTooltip = ({ title }: any) => {
  const { showImDialog } = useImbot();
  return (
    <Tooltip
      title={
        <>
          点击 <QuestionCircleOutlined /> 查看详情
        </>
      }
      placement="top"
      mouseEnterDelay={0.5}
    >
      <QuestionCircleOutlined
        style={{ marginLeft: '4px' }}
        onClick={e => {
          e.stopPropagation();
          showImDialog(title);
        }}
      />
    </Tooltip>
  );
};
