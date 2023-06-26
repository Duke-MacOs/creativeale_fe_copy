import { http } from '../axios';

class OneService {
  //获取项目id列表
  async fetchProjects(params: any): Promise<any> {
    const { data } = await http.get(`oneService/getProjectList`, { params });
    return data;
  }

  // 获取概览总指标
  async fetchOverview(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/overview`, params);
    return data;
  }

  // 根据adv_id获取概览总指标
  async fetchOverviewByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_overview`, params);
    return data;
  }

  // 获取概览列表
  async fetchOverviewList(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/overview_list`, params);
    return data;
  }
  // 根据adv_id获取概览列表
  async fetchOverviewListByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_overviewList`, params);
    return data;
  }

  // 获取版本（素材）列表
  async fetchVersionList(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/get_version_list`, params);
    return data;
  }

  // 获取趋势图数据
  async fetchTrendData(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/get_cases_trend_by_user`, params);
    return data;
  }

  // 根据adv_id获取趋势图数据
  async fetchTrendDataByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_trend`, params);
    return data;
  }

  // 获取用户性别数据
  async fetchUserGender(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/user_group_by_gender`, params);
    return data.data;
  }
  async fetchUserGenderByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_gender_data`, params);
    return data.data;
  }

  // 获取用户年龄数据
  async fetchUserAge(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/user_group_by_age`, params);
    return data.data;
  }
  async fetchUserAgeByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_age_data`, params);
    return data.data;
  }

  // 获取用户地区数据
  async fetchUserArea(params: any): Promise<any> {
    const {
      data: { data: send_data },
    } = await http.get(`oneService/query/send_cnt_by_area`, { params });
    const {
      data: { data: convert_data },
    } = await http.get(`oneService/query/convert_cnt_by_area`, { params });
    return { send_data, convert_data };
  }
  async fetchUserAreaByAdv(params: any): Promise<any> {
    const {
      data: { data: show_data },
    } = await http.get(`oneService/query/adv_area_show`, { params });
    const {
      data: { data: convert_data },
    } = await http.get(`oneService/query/adv_area_convert`, { params });
    return { show_data, convert_data };
  }

  // 获取排行榜数据
  async fetchRankingData(params: any): Promise<any> {
    const { data: showRanking } = await http.get(`oneService/query/get_show_ranking_list`, params);
    const { data: costRanking } = await http.get(`oneService/query/get_cost_ranking_list`, params);
    const { data: cpaRanking } = await http.get(`oneService/query/get_cpa_ranking_list`, params);
    return { show_data: showRanking.data, cost_data: costRanking.data, cpa_data: cpaRanking.data };
  }
  async fetchRankingDataByAdv(params: any): Promise<any> {
    const { data: showRanking } = await http.get(`oneService/query/adv_show_ranking`, params);
    const { data: costRanking } = await http.get(`oneService/query/adv_cost_ranking`, params);
    const { data: cpaRanking } = await http.get(`oneService/query/adv_cpa_ranking`, params);
    return { show_data: showRanking.data, cost_data: costRanking.data, cpa_data: cpaRanking.data };
  }

  // 获取正负向素材统计数据
  async fetchEffectData(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/get_effect_data_by_id`, params);
    return data.data;
  }
  async fetchEffectDataByAdv(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/adv_effect_by_id`, params);
    return data.data;
  }

  // 获取素材(直出互动)场景分析数据
  async fetchSceneFlowH5(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/scene_flow`, params);
    return data.data;
  }

  // 获取素材(互动视频)场景分析数据
  async fetchSceneFlowVideo(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/scene_flow_video`, params);
    return data.data;
  }

  // 获取素材(直出互动)图块名称映射表
  async fetchSectionMapH5(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/get_section_map`, params);
    return data.data;
  }

  // 获取素材(互动视频)图块名称映射表
  async fetchSectionMapVideo(params: any): Promise<any> {
    const { data } = await http.get(`oneService/query/get_section_map_video`, params);
    return data.data;
  }
  // 获取个场景分析数据
  async fetchSceneAnalysisData(params: any): Promise<any> {
    const { data: otherData } = await http.get(`oneService/query/scene_analysis`, params);
    const { data: showData } = await http.get(`oneService/query/get_section_show_cnt`, params);
    return { ...otherData.data, ...showData.data };
  }

  // 获取素材授权看数链接
  async fetchAuthorizeUrl(params: any): Promise<any> {
    const { data } = await http.get(`oneService/authorizeInvite`, { params });
    return data;
  }

  // 获取素材已授权看数的teamId
  async fetchAuthorizeTeams(params: any): Promise<any> {
    const { data } = await http.get(`oneService/authorizeTeams`, { params });
    return data;
  }
  // 取消看数授权
  async cancelAuthorize(params: any): Promise<any> {
    const { data } = await http.get(`oneService/cancelAuthorize`, { params });
    return data;
  }

  //获取服务商授权看数的素材列表
  async fetchAuthList(params: any): Promise<any> {
    const { data } = await http.get(`oneService/authList`, params);
    return data;
  }
}

export const oneService = new OneService();
