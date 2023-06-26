import { useEffect, useState } from 'react';
import { IFetchMaterialList } from '@/types/library';
import * as services from '@shared/api/library';
import type { FirstParam } from '@/types';
import { IMaterial } from '@/types/library';

const fetchMaterialList = async (params: FirstParam<IFetchMaterialList>) => {
  return services.fetchMaterialList(params);
};

export default (params: FirstParam<IFetchMaterialList>, reset: any) => {
  const [materialList, setMaterialList] = useState([] as IMaterial[]);
  const [isFetching, setIsFetching] = useState(false);
  const [update, setUpdate] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let outdated = false;
    setIsFetching(true);
    fetchMaterialList(Object.fromEntries(Object.entries(params).filter(([_, val]) => val !== '')) as any)
      .then(({ materialList, pagination: { total } }) => {
        if (!outdated) {
          setMaterialList(materialList.filter(item => item.type.cid !== 21));
          setTotal(total);
        }
      })
      .finally(() => {
        if (!outdated) {
          setIsFetching(false);
        }
      });
    return () => {
      outdated = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, update]);
  return {
    onFetch: (resetPage = false) => {
      if (resetPage) {
        reset();
      }
      setUpdate(n => n + 1);
    },
    materialList,
    isFetching,
    setMaterialList,
    total,
    setTotal,
  };
};
