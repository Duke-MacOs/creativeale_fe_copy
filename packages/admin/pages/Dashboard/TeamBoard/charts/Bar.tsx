import { Chart } from '.';

export const BarChart = ({ data }: any) => {
  return (
    <Chart
      option={{
        dataset: [
          {
            dimensions: ['id', 'project_name_fixed_id', 'number'],
            source: data,
          },
        ],
        xAxis: {
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 30,
            fontSize: 10,
          },
        },
        yAxis: {
          axisLabel: {
            show: true,
            formatter: function (value: any) {
              if (value >= 10000) {
                return `${value / 10000}W`;
              } else {
                return value;
              }
            },
          },
        },
        label: {
          show: true,
          position: 'top',
          color: 'black',
        },
        tooltip: {
          show: true,
          formatter: (value: any) => {
            return `${value.data[1]},${value.data[2]}`;
          },
        },
        series: {
          type: 'bar',
          encode: { x: 'project_name_fixed_id', y: 'number' },
          datasetIndex: 0,
          barWidth: '50%',
          itemStyle: {
            normal: {
              label: {
                show: true,
                fontSize: 10,
                formatter: function (value: any) {
                  if (value.data[2] > 10000) {
                    return `${(value.data[2] / 10000).toFixed(0)}W`;
                  } else {
                    return value.data[2].toFixed(0);
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
