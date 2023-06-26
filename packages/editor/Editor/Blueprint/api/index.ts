import { http } from '@shared/api';
import { DynamicResource, Result } from './types';

/**
 * 发布动态资源
 * https://bytedance.feishu.cn/wiki/wikcni46LG9NKKr8wZZ8DRwh3CN
 * @param props
 * @returns
 */
export async function publishDynamicResource({ description = '', isPublic = 0, ...rest }: DynamicResource) {
  const { data } = await http.post('user/dynamicResource/create', { isPublic, description, ...rest });
  return data.data;
}

/**
 * 获取公共资源
 * @param param0
 * @returns
 */
export async function fetchDynamicResources<
  T extends Pick<DynamicResource, 'type'> & {
    /**
     * 是否为团队资源
     */
    isTeam?: boolean;
    /**
     * 团队资源是否需要包括自身的资源
     */
    excludeSelf?: boolean;
    page?: number;
    pageSize?: number;
  }
>({
  isTeam = false,
  page = 1,
  pageSize = 99,
  ...rest
}: T): Promise<{
  list: Result<T['type']>[];
  total: number;
}> {
  const { data } = await http.get('user/dynamicResource/list', {
    params: {
      isTeam,
      page,
      pageSize,
      ...rest,
    },
  });
  return data.data;
}

export async function unpublishDynamicResource(props: { id: number }) {
  const { data } = await http.post('user/dynamicResource/delete', props);
  return data.data;
}
