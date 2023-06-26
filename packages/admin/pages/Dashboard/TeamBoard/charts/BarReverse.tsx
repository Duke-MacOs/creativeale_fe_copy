import { Chart } from '.';

export const BarReverseChart = ({ data }: any) => {
  return (
    <Chart
      style={{ zIndex: 0, height: '330px', width: '510px', textAlign: 'center' }}
      option={{
        dataset: [
          {
            dimensions: ['age', 'number'],
            source: data,
          },
          {
            transform: {
              type: 'sort',
              config: { dimension: 'number', order: 'asc' },
            },
          },
        ],

        // 图例
        tooltip: {
          show: true,
        },
        yAxis: {
          type: 'category',
          rotate: 25,
          // 设置坐标轴样式
          axisLine: {
            show: false,
            onZero: false,
            dashOffset: 10,
            marginRight: 10,
            lineStyle: {
              width: 2,
              color: '#4488bb',
            },
          },
          // 默认值为 axisLine.lineStyle.color
          axisLabel: {
            show: true,
            color: 'black',
            // 默认的 'auto' 会导致显示一个间隔一个
            interval: 0,
            fontSize: 11,
            margin: 5,
          },
          axisTick: { show: false },
          // category 类轴默认不显示网格线
          splitLine: {
            show: false,
          },
        },
        xAxis: {
          splitNumber: 4,
          // 设置坐标轴样式
          axisLine: {
            show: false,
            onZero: false,
            dashOffset: 10,
            lineStyle: {
              width: 2,
              color: '#4488bb',
            },
          },
          splitLine: {
            show: false,
          },

          // 默认值为 axisLine.lineStyle.color
          axisLabel: {
            show: false,
          },
        },
        label: {
          show: true,
          position: 'right',
          color: 'black',
        },
        emphasis: {
          focus: 'series',
        },
        series: {
          type: 'bar',
          barWidth: '50%',
          barMinHeight: 1,
          encode: { y: 'age', x: 'number' },
          datasetIndex: 1,
          itemStyle: {
            normal: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: '#6276fe', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: '#988bfe', // 100% 处的颜色
                  },
                ],
              },
              borderRadius: [1, 5, 5, 1],
              label: {
                show: true,
                formatter: function (value: any) {
                  if (value.data[1] >= 10000) {
                    return `${(value.data[1] / 10000).toFixed(2)}W`;
                  } else {
                    return value.data[1];
                  }
                },
              },
            },
          },
        },
      }}
    />
  );
};
