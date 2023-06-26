import { TablePaginationConfig } from 'antd';
import { usePageParams } from '../../routes/withPath';

export const usePagination = (total?: number): TablePaginationConfig => {
  const {
    onParamsChange,
    params: { pageSize, page },
  } = usePageParams();

  return {
    pageSize,
    total: total,
    current: page,
    showQuickJumper: true,
    onChange(page, pageSize) {
      onParamsChange({ page, pageSize }, 'unReset');
    },
    showTotal(total) {
      return `共 ${total} 条数据`;
    },
  };
};
