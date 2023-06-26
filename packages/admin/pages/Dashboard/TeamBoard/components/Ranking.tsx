import { Space, GraphTitle } from '.';
import { IRankingData } from '../type';
import { BarChart } from '../charts/Bar';
import { Empty } from 'antd';

export const Ranking = ({ rankingData }: { rankingData: IRankingData | undefined }) => {
  return (
    <Space
      size={100}
      style={{
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        gridTemplateColumns: 'repeat(3,33%)',
      }}
    >
      <div>
        <GraphTitle>排行榜-展示（次）</GraphTitle>
        {rankingData?.show_data?.length ? <BarChart data={rankingData?.show_data} /> : <Empty />}
      </div>
      <div>
        <GraphTitle>排行榜-消耗（元）</GraphTitle>
        {rankingData?.cost_data?.length ? (
          <BarChart data={rankingData?.cost_data || []} title="排行榜-消耗（元）" />
        ) : (
          <Empty />
        )}
      </div>
      <div>
        <GraphTitle>排行榜-cpa（元）</GraphTitle>
        {rankingData?.cpa_data?.length ? (
          <BarChart data={rankingData?.cpa_data || []} title="排行榜-cpa（元）" />
        ) : (
          <Empty />
        )}
      </div>
    </Space>
  );
};
