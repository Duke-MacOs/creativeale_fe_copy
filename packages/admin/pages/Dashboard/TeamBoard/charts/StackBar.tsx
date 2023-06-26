import { Chart } from '.';

export type StackBarChartProps = {
  category: string[];
  series: Array<{ name: string; data: number[] }>;
};

export const StackBarChart = ({ category, series }: StackBarChartProps) => {
  return (
    <Chart
      option={{
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow'
          },
        },
        legend: {
          top: '5%',
          show: true,
        },
        grid: {
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'value',
          splitNumber: 3,
          gridIndex: 0,
        },
        yAxis: {
          type: 'category',
          data: category,
          offset: 1,
        },
        label: {
          show: true,
          position: 'inside',
          // 数值为 0 时不显示 label
          formatter: ({ value }: { value: number }) => (value ? value : ''),
        },
        emphasis: {
          focus: 'series',
        },
        series: series.map(item => ({ ...item, type: 'bar', stack: 'total' })),
      }}
    />
  );
};
