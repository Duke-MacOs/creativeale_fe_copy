import { http } from './axios';

// 获取所有 advIds
export const getAllAdvIds = async () => {
  const {
    data: {
      data: {
        advertiser: { company_id, id },
      },
    },
  } = await http.get('user/getAdvInfoBySelfId');
  return getAdvIdsByPage(company_id || id);
};
const getAdvIdsByPage = async (
  companyId: string,
  page = 1,
  pageSize = 100
): Promise<Array<{ id: string; name: string }>> => {
  const {
    data: {
      data: { total, list },
    },
  } = await http.post(`user/getCompanyAdvs?page=${page}&pageSize=${pageSize}`, { companyId });
  if (page * pageSize >= total) {
    return list;
  }
  return list.concat(await getAdvIdsByPage(companyId, page + 1, pageSize));
};
