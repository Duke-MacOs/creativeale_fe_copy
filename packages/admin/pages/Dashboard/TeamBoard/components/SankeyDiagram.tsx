import { ISceneFlowData } from '../type';
import { Empty } from 'antd';
import StateContainer from './StateContainer';
import { SankeyChart } from '../charts/Sankey';

export const SankeyDiagram = StateContainer(
  ({ data }: { data: ISceneFlowData }) => {
    return data.nodes ? <SankeyChart data={data} /> : <Empty />;
  },
  'sankeyDiagram',
  { height: '800px', width: '100%' }
);
