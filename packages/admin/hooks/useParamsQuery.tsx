import { useImmer } from '@byted/hooks';
import { useLoadingAction } from '@main/table';
import { isObject, pickBy } from 'lodash';
import { useRef, useState } from 'react';
import { QueryKey, useQuery } from 'react-query';
import { IPageParams, usePageParams } from '@main/routes/withPath';
import { IPagination } from '@shared/types/apis';
import { IProjectFromServer } from '@main/pages/Projects/ProjectList/api';

export const useParamsQuery = <Params, Data extends { list: any[]; pagination: { total: number }; currentId?: string }>(
  queryKey: QueryKey,
  loader: (params: Params) => Promise<Data>,
  params: Params
) => {
  const { startLoading, stopLoading } = useLoadingAction();
  const [list, setList] = useImmer([] as Data['list']);
  const restData = useRef<Omit<Data, 'list' | 'pagination'>>();
  const [total, setTotal] = useState(0);

  const { refetch } = useQuery({
    queryKey,
    queryFn: () => {
      startLoading();
      const searchParams = isObject(params) ? (pickBy(params, value => Boolean(value)) as any) : params;
      return loader(searchParams);
    },
    onSuccess: ({ list, pagination, ...rest }) => {
      setList(list);
      setTotal(pagination?.total);
      restData.current = rest;
    },
    onSettled: stopLoading,
  });

  return { refetch, list, setList, restData: restData.current, total, setTotal };
};

export const useProjectQuery = (
  loader: (params: IPageParams) => Promise<{ pagination: IPagination; list: IProjectFromServer[]; isVersion?: boolean }>
) => {
  const { params } = usePageParams();
  const {
    restData: { isVersion = false } = { isVersion: false },
    list: projectList,
    setList: setProjectList,
    refetch: reloadProject,
    ...rest
  } = useParamsQuery([loader, params], loader, params);

  return {
    ...rest,
    projectList,
    setProjectList,
    reloadProject,
    isVersion,
  };
};
