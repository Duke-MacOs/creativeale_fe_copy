export interface IOnlineData {
  id?: number;
  experiment_name?: string;
  cost?: number | string;
  cpa?: number | string;
  show_cnt?: number | string;
  click_cnt?: number | string;
  convert_cnt?: number | string;
  atr?: number | string;
  pvr?: number | string;
  send_cnt?: number | string;
  total?: number;
  playable_url?: string;
  project_name_fixed_id?: string;
  audit_h5?: string;
  load_complete_rate?: number;
  start_playable_rate?: number;
  complete_playable_rate?: number;
  size?: number;
  files_count?: number;
  direct_playable_type?: number;
}
export interface ITrendData {
  cost?: number[];
  cpa?: number[];
  show_cnt?: number[];
  click_cnt?: number[];
  convert_cnt?: number[];
  pvr?: number[];
  send_cnt?: number[];
  date?: string[];
}
export interface IAgeOrGenderData {
  convert_data?: { value: number; name: string }[];
  send_data?: { value: number; name: string }[];
  show_data?: { value: number; name: string }[];
}
export interface ISceneAnalysisData {
  show_data?: { value: number; name: string }[];
  skip_data?: { value: number; name: string }[];
  click_data?: { value: number; name: string }[];
  click_at_background_ad_data?: { value: number; name: string }[];
  click_at_draw_ad_data?: { value: number; name: string }[];
}

export interface ISceneFlowData {
  sections?: {
    id: number;
    name: string;
    section: string;
  }[];
  edges?: {
    source: number | undefined;
    target: number | undefined;
    count: number;
    rate: number;
  }[];
  nodes?: {
    name: string;
  }[];
  links?: {
    source: string | undefined;
    target: string | undefined;
    value: number;
  }[];
}

export interface IRankingData {
  cost_data?: { value: number; name: string }[];
  show_data?: { value: number; name: string }[];
  cpa_data?: { value: number; name: string }[];
}

export interface IEffectData {
  cpa_data?: { value: number; name: string }[];
  pvr_data?: { value: number; name: string }[];
}
