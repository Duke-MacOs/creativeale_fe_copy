import Filter from './Filter';
import styles from '../TeamResource/style';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import useCategories from './hooks/useCategories';
import Library from './Library';
import useMaterial, { ISearchParams } from './hooks/useMaterial';
import { message } from 'antd';
import { StoreMaterialStatus } from '@shared/types/store';

export interface IProps {
  type: 'admin' | 'super';
  visible: boolean;
}

export const getStatusTagColor = (status: StoreMaterialStatus) => {
  switch (status) {
    case StoreMaterialStatus.shelve:
      return 'green';
    case StoreMaterialStatus.deleted:
      return 'red';
    default:
      return '#D395E0';
  }
};

export default ({ visible, type }: IProps) => {
  const [params, setParams] = useState<ISearchParams>({
    keyword: '',
    type: -1,
    status: -1,
    category: '0',
    page: 1,
    pageSize: 60,
  });
  const prevSearchRef = useRef<ISearchParams>();
  const { categories, getCategories } = useCategories();
  const { loading: isFetching, materialList, getMaterialList, total } = useMaterial();

  useEffect(() => {
    if (visible && (!prevSearchRef.current || prevSearchRef.current?.keyword === params.keyword)) {
      onSearch();
    }
  }, [params, visible]);

  useEffect(() => {
    getCategories(params.type);
  }, [params.type]);

  const onSearch = async () => {
    try {
      getMaterialList(params);
      prevSearchRef.current = params;
    } catch (e) {
      message.error('获取列表出错：' + e);
    }
  };

  return (
    <div className={styles.wrapper} style={{ width: '100%' }}>
      <Filter
        keyword={params.keyword}
        type={params.type}
        status={params.status}
        category={params.category}
        categories={categories}
        onChange={params => {
          setParams(prev => ({
            ...prev,
            ...params,
          }));
        }}
        onSearch={onSearch}
      />
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={styles.content}>
          <div style={{ flex: 1 }}>
            <Library
              type={type}
              list={materialList}
              total={total}
              page={params.page}
              pageSize={params.pageSize}
              isFetching={isFetching}
              onChange={particle => {
                setParams(prev => ({
                  ...prev,
                  ...particle,
                }));
              }}
              onRefetch={(resetPage?: boolean) => {
                getMaterialList({ ...params, page: resetPage ? 1 : params.page });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
