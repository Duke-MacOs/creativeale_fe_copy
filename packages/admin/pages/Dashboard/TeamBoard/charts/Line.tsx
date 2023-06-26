import { Chart } from '.';

export type LineProps = {
  category: string[];
  series: Array<{ name: string; symbol: string; itemStyle?: Record<string, any>; data: number[] }>;
};
export const LineChart = ({ category, series }: LineProps) => {
  return (
    <Chart
      option={{
        series: series.map(item => ({
          ...item,
          type: 'line',
          symbolSize: 6,
          emphasis: {
            label: {
              show: true,
            },
          },
        })),
        legend: {
          top: '5%',
          show: true,
        },
        tooltip: {
          trigger: 'axis',
          padding: 20,
          textStyle: {
            fontSize: 12,
          },
          formatter: (data: any) => {
            const items: { [key: string]: string }[] = [];
            data.forEach((item: any) => {
              let value = '';
              if (['消耗', '展示数', '转化数', 'cpa'].includes(item.seriesName)) {
                if (!item.value) {
                  value = '-';
                } else if (item.value >= 10000) {
                  value = `${(item.value / 10000)?.toFixed(2)}万`;
                } else {
                  value = item.value?.toFixed(2);
                }
              } else if (item.seriesName === 'pvr') {
                const valuePercent = (item.value * 1000)?.toFixed(2);
                if (!valuePercent) {
                  value = '-';
                } else if (Number(valuePercent) > 0.01) {
                  value = `${(item.value * 1000)?.toFixed(2)}‰`;
                } else {
                  value = `<0.01‰`;
                }
              }
              items.push({ name: item.seriesName, value: value });
            });
            const colors = ['#6495ed', '#86cefa', '#ff68b4', '#1d90ff', '#a9c5f2', '#3ba272'];
            return items
              .map((item, index) => {
                const outerDiv = document.createElement('div');
                outerDiv.style.display = 'flex';
                outerDiv.style.alignItems = 'center';
                const div = document.createElement('div');
                div.style.borderRadius = '50%';
                div.style.width = '6px';
                div.style.height = '6px';
                div.style.display = 'inline-block';
                div.style.marginRight = '10px';
                div.style.backgroundColor = colors[index];
                outerDiv.innerHTML = div.outerHTML + `${item.name}:${item.value}`;
                return outerDiv.outerHTML;
              })
              .join('<br>');
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          boundaryGap: false,
          type: 'category',
          data: category,
          gridIndex: 0,
          // 设置坐标轴样式
          axisLine: {
            show: true,
            dashOffset: 10,
            marginRight: 10,
            lineStyle: {
              width: 2,
              color: '#4488bb',
            },
          },
          // category 类轴默认不显示网格线
          splitLine: {
            show: true,
          },
          // 默认值为 axisLine.lineStyle.color
          axisLabel: {
            color: 'black',
          },
        },
        yAxis: {
          type: 'value',
          splitNumber: 4,
          axisLine: {
            show: true,
            dashOffset: 10,
            marginRight: 10,
            lineStyle: {
              width: 2,
              color: '#4488bb',
            },
          },
          // 默认值为 axisLine.lineStyle.color
          axisLabel: {
            color: 'black',
          },
        },
        emphasis: {
          focus: 'series',
        },
      }}
    />
  );
};
