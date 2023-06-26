import { oneService } from '@shared/api/oneServiceAPI';
import { Empty, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { CasesTrend, SankeyDiagram, Section, VersionList, SceneFlow, SceneAnalysis } from '../components';
import { Filter, IFilter, ISearchParams } from '../components/Filter';
import { UserPortrait } from '../components/UserPortrait';
import { IAgeOrGenderData, IOnlineData, ISceneAnalysisData, ISceneFlowData } from '../type';
import { translateDateToDay } from '../utils';
import useRequestState from '../hooks/useRequestState';
import { pick } from 'lodash';
import moment from 'moment';

export default ({ visible, currentPage }: { visible: boolean; currentPage: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [trendData, setTrendData] = useState();
  const [genderData, setGenderData] = useState<IAgeOrGenderData>();
  const [ageData, setAgeData] = useState<IAgeOrGenderData>();
  const [areaData, setAreaData] = useState<IAgeOrGenderData>();
  const [params, setParams] = useState<ISearchParams>();
  const [versionList, setVersionList] = useState<IOnlineData[]>();
  const [sceneFlowData, setSceneFlowData] = useState<ISceneFlowData>();
  const [sceneAnalysisData, setSceneAnalysisData] = useState<ISceneAnalysisData>();
  const [sectionMap, setSectionMap] = useState<[]>();
  const [currentPlayableData, setCurrentPlayableData] = useState<{
    playableUrl: string;
    auditH5: string;
    direct_playable_type: number;
  }>({ playableUrl: '', auditH5: '', direct_playable_type: 0 });
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [exitFetchs, setExitFetchs] = useState<number[]>([]);

  const requestDecorate = useRequestState('edit');

  // 获取素材列表
  const fetchAuthList = requestDecorate(['versionList'], async (params: any) => {
    const { data } = await oneService.fetchAuthList({
      params,
    });
    setVersionList(data);
    setCurrentPlayableData({
      playableUrl: data[0]?.playable_url ?? '',
      auditH5: data[0]?.audit_h5.replace(/\"/g, '') ?? '',
      direct_playable_type: data[0]?.direct_playable_type ?? '',
    });
    setExitFetchs([]);
  });

  const fetchGenderData = async (params: any) => {
    // const data = await oneService.fetchUserGender({ params });
    const data = await oneService.fetchUserGenderByAdv({ params });
    setGenderData(data);
  };

  const fetchAgeData = async (params: any) => {
    // const data = await oneService.fetchUserAge({ params });
    const data = await oneService.fetchUserAgeByAdv({ params });

    setAgeData(data);
  };

  // 用户画像地区
  const fetchAreaData = async (params: any, areaName = 'province_name') => {
    // const data = await oneService.fetchUserArea({ ...params, area: areaName });
    const data = await oneService.fetchUserAreaByAdv({ ...params, area: areaName });
    setAreaData(data);
  };

  const fetchUserPortrait = requestDecorate(['userPortrait'], async (params: any) => {
    await fetchGenderData(params);
    await fetchAgeData(params);
    await fetchAreaData(params);
  });

  const fetchCaseTrendByUser = requestDecorate(['caseTrend'], async (params: any) => {
    // const { data } = await oneService.fetchTrendData({ params });
    const { data } = await oneService.fetchTrendDataByAdv({ params });
    setTrendData(data);
  });

  const fetchSceneAnalysisData = requestDecorate(['sceneAnalysis'], async (params: any) => {
    const data = await oneService.fetchSceneAnalysisData({ params });
    setSceneAnalysisData(data);
  });

  const fetchSceneFlow = requestDecorate(['sceneFlow', 'sankeyDiagram', 'SceneAnalysis'], async (params: any) => {
    const sectionMap =
      currentPlayableData.direct_playable_type === 3
        ? await oneService.fetchSectionMapVideo({ params })
        : await oneService.fetchSectionMapH5({ params });
    setSectionMap(sectionMap);
    const data =
      Number(currentPlayableData.direct_playable_type) === 3
        ? await oneService.fetchSceneFlowVideo({ params })
        : await oneService.fetchSceneFlowH5({ params });
    setSceneFlowData({
      ...data,
      sections:
        data?.sections?.map((i: any) => ({
          ...i,
          section: sectionMap?.find((s: any) => s.playable_section_remark === i.name)?.playable_intent_section,
        })) ?? [],
    });
  });
  const onSearch: IFilter['onSearch'] = async params => {
    setLoading(true);
    setExitFetchs([]);
    setParams(params);
    currentPage === 'auth' && (await fetchAuthList(translateDateToDay({ ...params })));
    setLoading(false);
  };
  const loadData = async (playable_url: string) => {
    if (scrollTop === 0 && !exitFetchs.includes(0)) {
      await fetchCaseTrendByUser(translateDateToDay({ ...params, playable_url }));
    } else if (scrollTop === 200 && !exitFetchs.includes(200)) {
      await fetchUserPortrait(translateDateToDay({ ...params, playable_url }));
    } else if (scrollTop === 800 && !exitFetchs.includes(800)) {
      await fetchSceneFlow(translateDateToDay({ ...params, playable_url }));
      await fetchSceneAnalysisData(translateDateToDay({ ...params, playable_url }));
    }
    setExitFetchs(preState => preState.concat(scrollTop));
  };
  useEffect(() => {
    onSearch({
      ...params,
      date: [moment().startOf('day').subtract(7, 'd'), moment().startOf('day').subtract(1, 'd')],
    });
  }, [currentPage]);
  useEffect(() => {
    // 滚动条滚动时触发
    const scrollChange = () => {
      // 监听滚动条距离左部距离
      const top = document.documentElement.scrollTop;
      if (top < 200) {
        setScrollTop(0);
      } else if (top >= 200 && top < 800) {
        setScrollTop(200);
      } else if (top >= 800) {
        setScrollTop(800);
      }
    };
    window.addEventListener('scroll', scrollChange);
    return () => {
      window.removeEventListener('scroll', scrollChange);
    };
  }, []);

  useEffect(() => {
    if (currentPage === 'auth') {
      try {
        loadData(currentPlayableData!.playableUrl);
      } catch (e) {
        message.error(e);
      }
    }
  }, [currentPlayableData, scrollTop]);

  return (
    <div
      style={{
        display: visible ? 'block' : 'none',
      }}
    >
      <Filter onSearch={onSearch} currentPage={currentPage} />
      <div style={{ margin: '20px' }}>
        {loading ? (
          <Spin style={{ width: '100%', top: '50%' }} />
        ) : (
          <>
            <Section
              title="素材列表"
              Component={
                <VersionList
                  data={versionList}
                  params={params}
                  fetchVersionList={fetchAuthList}
                  setCurrentPlayableData={setCurrentPlayableData}
                  currentPlayableData={currentPlayableData}
                  setExitFetchs={setExitFetchs}
                  currentPage={currentPage}
                />
              }
            />
            {currentPlayableData.playableUrl && <Section title="趋势图" Component={<CasesTrend data={trendData} />} />}
            {currentPlayableData.playableUrl && (
              <Section
                title="用户画像"
                Component={
                  <UserPortrait
                    genderData={genderData}
                    ageData={ageData}
                    areaData={areaData}
                    fetchAreaData={fetchAreaData}
                    params={translateDateToDay({ ...params, playable_url: currentPlayableData.playableUrl })}
                  />
                }
              />
            )}
            {currentPlayableData.playableUrl && (
              <Section
                title="场景分析"
                Component={
                  <>
                    <SceneFlow
                      visible={visible}
                      sceneFlowData={pick(sceneFlowData, ['sections', 'edges'])}
                      sceneAnalysisData={sceneAnalysisData}
                      currentPlayableData={currentPlayableData}
                    />
                    {sceneAnalysisData && (
                      <SceneAnalysis sceneAnalysisData={sceneAnalysisData} sectionMap={sectionMap} />
                    )}
                  </>
                }
              />
            )}

            {currentPlayableData.playableUrl && (
              <Section
                title="桑基图"
                Component={
                  currentPlayableData.playableUrl ? (
                    <SankeyDiagram data={pick(sceneFlowData, ['nodes', 'links'])} />
                  ) : (
                    <Empty />
                  )
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
