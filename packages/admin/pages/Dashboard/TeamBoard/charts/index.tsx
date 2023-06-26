import * as echarts from 'echarts';
import ReactECharts, { EChartsReactProps } from 'echarts-for-react';
import { merge } from 'lodash';
import json from './theme.json';

const { theme } = json;

// 注册主题
echarts.registerTheme('clab_theme', theme);

export const Chart = ({ style, option, ...rest }: EChartsReactProps) => {
  // 默认配置。
  const DefaultOption = {
    label: {
      color: 'white',
    },
    xAxis: option.xAxis ? AxisDefaultOption : undefined,
    yAxis: option.yAxis ? AxisDefaultOption : undefined,
  };

  return (
    <ReactECharts
      {...{
        ...rest,
        // 使用自定义主题
        theme: 'clab_theme',
        // 所有图表的默认样式
        style: {
          height: 265,
          width: '100%',
          ...style,
        },
        // 使用 merge 函数是为了递归合并
        option: merge({}, DefaultOption, option),
      }}
    />
  );
};

const AxisDefaultOption = {
  // 坐标轴的默认样式
  axisLine: {
    show: true,
    lineStyle: {
      width: 2,
      color: '#4488bb',
    },
  },
  // 当坐标轴的 type 为 'category' 时默认不显示网格线
  splitLine: {
    show: true,
  },
  // 标签的默认颜色为上面设置的对称轴的颜色，这里需要覆盖为黑色
  axisLabel: {
    color: 'black',
  },
};
