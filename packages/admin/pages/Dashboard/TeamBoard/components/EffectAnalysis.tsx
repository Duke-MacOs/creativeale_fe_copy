import { EmptyWrapper, Space, GraphTitle } from '.';
import { PieChart } from '../charts/Pie';
import { IEffectData } from '../type';
import StateContainer from './StateContainer';

export const EffectAnalysis = StateContainer(({ effectData }: { effectData: IEffectData | undefined }) => {
  return (
    <Space
      size={100}
      style={{
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
        gridTemplateColumns: '20% 20%',
      }}
    >
      <div>
        <GraphTitle>cpa正负向</GraphTitle>
        {effectData?.cpa_data?.length ? (
          <PieChart data={effectData?.cpa_data} legendPosition="bottom" height="250px" />
        ) : (
          <EmptyWrapper height="250px" />
        )}
      </div>
      <div>
        <GraphTitle>pvr正负向</GraphTitle>
        {effectData?.pvr_data?.length ? (
          <PieChart data={effectData?.pvr_data} legendPosition="bottom" height="250px" />
        ) : (
          <EmptyWrapper height="250px" />
        )}
      </div>
    </Space>
  );
}, 'userPortrait');
