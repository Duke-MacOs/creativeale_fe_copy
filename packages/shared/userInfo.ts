import { http } from '@shared/api';
import type { IUserInfo } from '@shared/types';
import create from 'zustand';

export const useUserInfo = create<{
  userInfo: IUserInfo;
  loading: boolean;
  updateUserInfo(teamId?: string): Promise<void>;
  setUserInfo(_: (userInfo: IUserInfo) => Partial<IUserInfo>): void;
}>(set => {
  const setUserInfo = (getPartial: (userInfo: IUserInfo) => Partial<IUserInfo>) => {
    set(({ userInfo }) => ({ userInfo: { ...userInfo, ...getPartial(userInfo) } }));
  };
  const updateUserInfo = async (teamId?: string | number): Promise<void> => {
    try {
      if (teamId) {
        set({ loading: true });
        await http.post('team/switch', { teamId }).catch(error => {
          console.error(error);
        });
      }
      const userInfo = await getUserInfo();
      // userInfo.teamId = 3;
      const advTeam = getAadvidTeam(userInfo);
      if (advTeam) {
        return updateUserInfo(advTeam.id);
      }
      if (userInfo.teams.every(({ id }) => id !== userInfo.teamId)) {
        return updateUserInfo(userInfo.teams.reverse()[0].id);
      }
      set({
        userInfo,
        loading: false,
      });
      initCollect(userInfo);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  };
  return {
    updateUserInfo,
    setUserInfo,
    userInfo: undefined as any,
    loading: true,
  };
});

async function getUserInfo(): Promise<IUserInfo> {
  const {
    data: { data: userInfo },
  } = await http.get('team/userinfo');
  // 不同测试环境下字段定义不同,返回时需要做兼容处理
  return {
    ...userInfo,
    name: userInfo.name || userInfo.userName,
    avatar: userInfo.avatarUrl || userInfo.avatar,
    userId: userInfo.staffId || userInfo.userId,
  };
}

export const FeaturesMap = {
  '<all>': '所有功能',
  '<publish_example>': '案例功能',
  '<direct_play>': '直出互动',
  '<dashboard>': '数据披露',
  '<export_project>': '导出项目',
  '<clab_feature>': '内网测试功能', // 原本内网中开放的一些功能，如落地页导出为URL等
  '<download_zip>': '下载zip包',
  '<export_as_h5>': '导出为H5',
  // '<blueprint>': '蓝图功能',
  // '<archive>': '归档功能',
};

export function useHasFeature(feature: keyof typeof FeaturesMap = '<all>') {
  const { userInfo } = useUserInfo();
  if (!userInfo) {
    return false;
  }
  return userHasFeature(userInfo, feature);
}

export function hasFeature(feature: keyof typeof FeaturesMap = '<all>') {
  const { userInfo } = useUserInfo.getState();
  if (!userInfo) {
    return false;
  }
  return userHasFeature(userInfo, feature);
}

export function userHasFeature(userInfo: IUserInfo, feature: keyof typeof FeaturesMap = '<all>') {
  const { teams, teamId } = userInfo;
  const { features } = teams.find(({ id }) => id === teamId)!;
  return (
    features.includes('<all>') ||
    features.includes(feature) ||
    (feature === '<direct_play>' && userInfo.hasDirectPlayable) ||
    false
  );
}

const getAadvidTeam = ({ teams, teamId }: IUserInfo) => {
  const aadvid = new URLSearchParams(location.search).get('aadvid');
  if (aadvid && Number(aadvid) > 0) {
    return teams.find(({ id, advId }) => id !== teamId && advId === aadvid);
  }
};

const initCollect = ({ userId, teamId, teams }: IUserInfo) => {
  if (process.env.NODE_ENV !== 'development') {
    window.collectEvent('init', {
      app_id: 7887,
      channel: 'cn',
      // 开启调试日志
      log: process.env.NODE_ENV === 'development',
      // 默认关闭，需要热力图及圈选功能可开启
      autotrack: false,
    });

    window.collectEvent('config', {
      user_unique_id: userId,
      evtParams: {
        teamType: teams.find(({ id }) => id === teamId)?.type,
        teamId,
      },
    });
    window.collectEvent('start');
  }
};
