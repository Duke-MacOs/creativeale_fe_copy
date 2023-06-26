import { oneService } from '@shared/api/oneServiceAPI';
import { Spin } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { CasesTrend, EffectAnalysis, Overview, OverviewList, Ranking, Section } from '../components';
import { Filter, IFilter, ISearchParams } from '../components/Filter';
import { UserPortrait } from '../components/UserPortrait';
import { IAgeOrGenderData, IEffectData, IOnlineData, IRankingData, ITrendData } from '../type';
import { translateDateToDay } from '../utils';

export default ({
  visible,
  setCurrentPage,
  currentPage,
  adv_id,
}: {
  visible: boolean;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  currentPage: string;
  adv_id: number;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [overviewData, setOverviewData] = useState<IOnlineData>();
  const [overviewList, setOverviewList] = useState<IOnlineData[]>();
  const [trendData, setTrendData] = useState<ITrendData>();
  const [params, setParams] = useState<ISearchParams>();
  const [genderData, setGenderData] = useState<IAgeOrGenderData>();
  const [ageData, setAgeData] = useState<IAgeOrGenderData>();
  const [areaData, setAreaData] = useState<IAgeOrGenderData>();
  const [rankingData, setRankingData] = useState<IRankingData>();
  const [effectData, setEffectData] = useState<IEffectData>();
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [exitFetchs, setExitFetchs] = useState<number[]>([]);

  // 获取所有的项目id
  /* const fetchProjects = async (params: any) => {
    const { data } = await oneService.fetchProjects(translateDateToDay(params));
    setParams({ ...params, ids: data, role: '' });
  }; */

  const fetchOverviewData = async (params: any) => {
    // const { data } = await oneService.fetchOverview({ params });
    const { data } = await oneService.fetchOverviewByAdv({ params });
    setOverviewData(data);
  };
  const fetchOverviewList = async (params: any) => {
    // const { data } = await oneService.fetchOverviewList({ params });
    const { data } = await oneService.fetchOverviewListByAdv({ params });
    setOverviewList(data);
  };

  const fetchCaseTrendByUser = async (params: any) => {
    // const { data } = await oneService.fetchTrendData({ params });
    const { data } = await oneService.fetchTrendDataByAdv({ params });
    setTrendData(data);
  };
  // 用户画像性别
  const fetchGenderData = async (params: any) => {
    // const data = await oneService.fetchUserGender({ params });
    const data = await oneService.fetchUserGenderByAdv({ params });
    setGenderData(data);
  };

  // 用户画像年龄
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

  //排行榜数据
  const fetchRankingData = async (params: any) => {
    // const data = await oneService.fetchRankingData({ params });
    const data = await oneService.fetchRankingDataByAdv({ params });
    setRankingData(data);
  };
  //正负向数据
  const fetchEffectData = async (params: any) => {
    // const data = await oneService.fetchEffectData({ params });
    const data = await oneService.fetchEffectDataByAdv({ params });
    setEffectData(data);
  };

  const onSearch: IFilter['onSearch'] = async params => {
    setLoading(true);
    setExitFetchs([]);
    setParams({ ...params, adv_id });
    // await fetchProjects(params);
  };
  useEffect(() => {
    onSearch({
      ...params,
      date: [moment().startOf('day').subtract(7, 'd'), moment().startOf('day').subtract(1, 'd')],
      adv_id,
    });
  }, []);

  useEffect(() => {
    // 滚动条滚动时触发
    const scrollChange = () => {
      // 监听滚动条距离左部距离
      const top = document.documentElement.scrollTop;
      if (top < 300) {
        setScrollTop(0);
      } else if (top >= 300 && top < 800) {
        setScrollTop(300);
      } else if (top >= 800) {
        setScrollTop(800);
      }
    };
    window.addEventListener('scroll', scrollChange);
    return () => {
      window.removeEventListener('scroll', scrollChange);
    };
  }, []);

  const loadData = async (params: any) => {
    if (scrollTop === 0 && !exitFetchs.includes(0)) {
      await fetchOverviewData(translateDateToDay(params));
      await fetchOverviewList(translateDateToDay(params));
      await fetchCaseTrendByUser(translateDateToDay(params));
      setLoading(false);
    } else if (scrollTop === 300 && !exitFetchs.includes(300)) {
      await fetchGenderData(translateDateToDay(params));
      await fetchAgeData(translateDateToDay(params));
      await fetchAreaData(translateDateToDay(params));
    } else if (scrollTop === 800 && !exitFetchs.includes(800)) {
      await fetchRankingData(translateDateToDay(params));
      await fetchEffectData(translateDateToDay(params));
    }
    setExitFetchs(preState => preState.concat(scrollTop));
  };

  useEffect(() => {
    if (currentPage === 'main') {
      if (params) {
        loadData(params);
      }

      /* if (params?.ids?.length) {
        loadData(params);
      } else {
        setLoading(false);
      } */
    }
  }, [params, scrollTop]);
  return (
    <div
      style={{
        display: visible ? 'block' : 'none',
        width: '100%',
      }}
    >
      <Filter onSearch={onSearch} />
      <div style={{ margin: '40px' }}>
        {
          loading ? (
            <Spin style={{ width: '100%', top: '50%' }} />
          ) : (
            /* params?.ids?.length ? */ <>
              <Section title="数据概览" Component={<Overview data={overviewData} />} />
              <Section
                title="项目列表"
                Component={
                  <OverviewList
                    data={overviewList}
                    setCurrentPage={setCurrentPage}
                    params={params}
                    fetchOverviewList={fetchOverviewList}
                  />
                }
              />
              <Section title="趋势分析" Component={<CasesTrend data={trendData} />} />
              <Section
                title="用户画像"
                Component={
                  <UserPortrait
                    genderData={genderData}
                    ageData={ageData}
                    areaData={areaData}
                    fetchAreaData={fetchAreaData}
                    params={translateDateToDay({ ...params })}
                  />
                }
              />
              <Section title="排行榜" Component={<Ranking rankingData={rankingData} />} />
              <Section title="正负向统计" Component={<EffectAnalysis effectData={effectData} />} />
            </>
          ) /*  : (
          <Empty />
        ) */
        }
      </div>
    </div>
  );
};
