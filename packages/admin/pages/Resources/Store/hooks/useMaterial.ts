import { getMaterialList as getMaterialListApi } from '@shared/api/store';
import { IStoreMaterial } from '@shared/types/store';
import { throttle } from 'lodash';
import { useState } from 'react';

export interface ISearchParams {
  keyword: string;
  type: number;
  category: string;
  status: number;
  page: number;
  pageSize: number;
}

const getMaterialListThrottle = throttle(
  async (params: ISearchParams) => {
    return await getMaterialListApi(params);
  },
  1000,
  { trailing: false }
);

export default () => {
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [materialList, setMaterialList] = useState<IStoreMaterial[]>([]);

  // 获取商品列表
  const getMaterialList = async (params: ISearchParams) => {
    setLoading(true);
    try {
      const data = await getMaterialListThrottle(params);
      setMaterialList(data?.data ?? []);
      setTotal(data?.total ?? 0);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    total,
    loading,
    materialList,
    getMaterialList,
  };
};
