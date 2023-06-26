import { Chart } from '.';
import { ISceneFlowData } from '../type';

export const SankeyChart = ({ data }: { data: ISceneFlowData }) => {
  return (
    <Chart
      style={{ height: '800px', width: '100%' }}
      option={{
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
        },
        series: [
          {
            type: 'sankey',
            data: data.nodes,
            links: data.links,
            emphasis: {
              focus: 'adjacency',
            },
            left: '5%',
            right: '5%',
            nodeGap: 15,
            width: '85%',
            draggable: false,
            label: {
              color: 'black',
              fontSize: 10,
            },
            lineStyle: {
              color: 'gradient',
              curveness: 0.5,
            },
          },
        ],
      }}
    />
  );
};
