import { Chart } from '.';

type PieChartProps = {
  data: Array<{ value: number; name: string }> | undefined;
  // 支持将图例放在 上面，下面和左边
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  sectionMap?: [];
  height?: string;
  width?: string;
};

export const PieChart = ({ data, legendPosition, sectionMap, height, width }: PieChartProps) => {
  let pieData = data;
  if (!sectionMap) {
    pieData = data?.map(item => ({
      value: item.value,
      name: item.name,
      itemStyle: { color: item.name === '男' || item.name === '正向' ? '#5a77d1' : '#ff706f' },
    }));
  }
  const { legendProps } = {
    left: {
      legendProps: { top: '20%', left: '0', orient: 'vertical' },
    },
    right: {
      legendProps: { right: '20%', top: 'center', orient: 'vertical' },
    },
    top: {},
    // 当图例位于下面时，图表上面的留白看起来就比下面的留白多很多。这里采用的方法是移动整个容器而不是单独移动图表，
    // 因为标题的居中是参照图表的，图表偏移后为了居中所以标题也要跟着偏移，但是这个偏移的距离就很能得出
    bottom: {
      legendProps: { bottom: '25' },
    },
  }[legendPosition];

  return (
    <Chart
      style={{ height: height ? height : '330px', width: width ? width : '100%' }}
      option={{
        legend: {
          icon: 'path://M7.424 476.672L301.312 778.24s205.312-204.288 425.984 0c3.072 1.024 291.84-301.568 291.84-301.568s-466.944-519.168-1011.712 0',
          type: 'scroll',
          ...legendProps,
          formatter: function (name: string) {
            if (sectionMap) {
              const target = sectionMap.filter((item: any) => item.playable_intent_section === name);
              const remark = target.length ? (target[0] as any).playable_section_remark : '';
              return name + remark;
            }
            return name;
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: function (data: any) {
            const { name, value, percent } = data;
            if (value >= 10000) {
              return `${name}-${(value / 10000).toFixed(2)}万-${percent.toFixed(2)}%`;
            } else {
              return `${name}-${value}-${percent.toFixed(2)}%`;
            }
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['35%', '60%'],
            right: legendPosition === 'right' ? '50%' : 0,
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'center',
              formatter: () => {
                const sum = data!.reduce((pre, item) => pre + item.value, 0);
                if (sum >= 10000) {
                  return `${(sum / 10000).toFixed(2)}万`;
                } else {
                  return sum;
                }
              },
              fontStyle: 'normal',
              fontWeight: 'bold',
              fontSize: 15,
              color: '#6ea3ff',
            },
            data: pieData,
          },
          {
            color: 'transparent',
            type: 'pie',
            right: legendPosition === 'right' ? '50%' : 0,
            radius: ['35%', '60%'],
            emptyCircleStyle: {
              color: 'transparent',
              borderWidth: 1,
              borderColor: '#dedede',
            },
          },
        ],
      }}
    />
  );
};
