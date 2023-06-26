import { templateService } from '@shared/api/templateApi';
import { useLoadingAction } from '@main/table';
import { QUERY_KEY } from '@main/table/constants';
import { useQuery } from 'react-query';
export const useTagList = (enabled = true) => {
  const { startLoading, stopLoading } = useLoadingAction('正在获取模板标签');

  return (
    useQuery({
      enabled,
      staleTime: Infinity,
      queryKey: QUERY_KEY.CATEGORY_TAG,
      queryFn: () => {
        startLoading();
        return templateService.fetchCategoryTag({ category: 9, pageSize: 2000, origin: 1, parentName: '模板' });
      },
      onSettled: stopLoading,
    }).data || []
  );
};
