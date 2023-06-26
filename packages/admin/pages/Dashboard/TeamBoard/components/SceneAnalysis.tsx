import { EmptyWrapper, Space, GraphTitle } from '.';
import { PieChart } from '../charts/Pie';
import { ISceneAnalysisData } from '../type';
import StateContainer from './StateContainer';

export const SceneAnalysis = StateContainer(
  ({
    sceneAnalysisData,
    sectionMap,
  }: {
    sceneAnalysisData: ISceneAnalysisData | undefined;
    sectionMap: [] | undefined;
  }) => {
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
        {sectionMap ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GraphTitle>场景-show</GraphTitle>
              {sceneAnalysisData?.show_data?.length ? (
                <PieChart
                  data={sceneAnalysisData?.show_data}
                  legendPosition="right"
                  sectionMap={sectionMap}
                  height="250px"
                />
              ) : (
                <EmptyWrapper height="250px" />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GraphTitle>场景-skip</GraphTitle>
              {sceneAnalysisData?.skip_data?.length ? (
                <PieChart
                  data={sceneAnalysisData?.skip_data}
                  legendPosition="right"
                  sectionMap={sectionMap}
                  height="250px"
                />
              ) : (
                <EmptyWrapper height="250px" />
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GraphTitle>场景-click</GraphTitle>
              {sceneAnalysisData?.click_data?.length ? (
                <PieChart
                  data={sceneAnalysisData?.click_data}
                  legendPosition="right"
                  sectionMap={sectionMap}
                  height="250px"
                />
              ) : (
                <EmptyWrapper height="250px" />
              )}
            </div>
          </>
        ) : (
          <EmptyWrapper />
        )}
      </Space>
    );
  },
  'sceneAnalysis',
  { height: '350px', width: '100%' }
);
