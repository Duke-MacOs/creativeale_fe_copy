import { useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import Header from './components/Header';
import Cards from './components/Cards';
import Sidebar from './components/Sidebar';
import Detail from './components/Detail';
import SelectedArea from './components/SelectedArea';
import Categories from './components/Categories';
import Progress from './components/Progress';
import AI from './components/AI';
import useRequest, { IRequestProps } from './hooks/useRequest';
import useScrollBottom from './hooks/useScrollBottom';
import { Divider, Empty, Spin, message } from 'antd';
import { useCategories, useData, useExistData, useImportState, useModalState } from './Context';
import { useProject } from '@editor/aStore';
import React from 'react';
import shallow from 'zustand/shallow';
import { ImportStatus, SidebarType } from './type';

const PageSize = 60;

export default React.memo(({ visibleModal }: { visibleModal: true }) => {
  const projectId = useProject('id');
  const { modalState, updateModalState, getModalState } = useModalState(state => ({
    modalState: state.modalState,
    updateModalState: state.updateModalState,
    getModalState: state.getModalState,
  }));
  const { dimension, resourceType, sidebarType, categoryId } = modalState;
  const { data, updateData } = useData();
  const { updateData: updateExistData, initialFetch: initialFetchExistData } = useExistData();
  const { request, state: requestState, getProjectMaterials, getTeamCategories } = useRequest();
  const importStatus = useImportState(state => state.state.status, shallow);
  const updateCategories = useCategories(state => state.updateCategories, shallow);
  const [isAllLoad, setAllLoad] = useState(false); // 滚动加载是否全部加载完毕
  const containerRef = useRef<HTMLDivElement>(null);

  const getSearchBody = () => ({
    keyword: modalState.keyword,
    categoryId: modalState.categoryId,
    sidebarType: modalState.sidebarType,
    page: modalState.page,
    pageSize: PageSize,
    // sort: 'updated_at desc',
    type: modalState.resourceType,
  });

  const onIncreasePage = useCallback(async () => {
    try {
      if (isAllLoad) return;
      const body = {
        ...getSearchBody(),
        page: modalState.page + 1,
      };
      const res = await request(body);
      updateData([...data, ...res.data]);
      updateModalState({
        total: res.pagination.total,
        page: body.page,
      });
    } catch (error) {
      message.error(error.message);
    }
  }, [modalState, isAllLoad]);

  useScrollBottom(containerRef.current, onIncreasePage);

  // 获取项目已有资源
  useEffect(() => {
    // 资源导入完成和初始化时，才重新获取数据
    if (visibleModal || importStatus === ImportStatus.finish || initialFetchExistData === false) {
      getProjectMaterials(projectId).then(data => {
        updateExistData({ data: data.data, initialFetch: true });
      });
    }
  }, [importStatus, initialFetchExistData, visibleModal]);

  useEffect(() => {
    if (data.length === modalState.total) {
      setAllLoad(true);
    }
  }, [data, modalState.total]);

  useEffect(() => {
    setAllLoad(false);
    firstFetchData();
  }, [dimension, resourceType, sidebarType, categoryId]);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const categories = await getTeamCategories();
      updateCategories('team', categories);
    } catch (error) {
      message.error('获取分类错误:', error.message);
    }
  };

  const firstFetchData = useCallback(
    async (params?: Partial<IRequestProps>) => {
      console.log('modalState!:', modalState);
      try {
        updateData([]);
        const body = {
          ...getSearchBody(),
          page: 1,
          ...params,
        };
        const res = await request(body);
        console.log('res:', res);
        if (getModalState().resourceType === body.type) {
          updateData(res.data);
          updateModalState({
            total: res.pagination.total,
            page: body.page,
          });
        }
      } catch (error) {
        console.log('error:', error);
        message.error(error.message);
      }
    },
    [modalState, request]
  );

  const MaterialStage = (
    <>
      <Categories />

      <div
        ref={containerRef}
        style={{
          height: '100%',
          overflowY: 'scroll',
          margin: '0 0 20px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {data.length === 0 ? (
          !requestState.loading && <Empty />
        ) : (
          <Cards showBottomLine={isAllLoad && modalState.page > 1} />
        )}
      </div>
      {requestState.loading === resourceType && (
        <Spin
          style={
            data.length === 0
              ? { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
              : { marginTop: '20px' }
          }
          tip="加载中..."
        />
      )}
    </>
  );

  return (
    <div id="container">
      <Progress />
      <Header onFetchData={firstFetchData} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '70vh',
            flex: 1,
            width: '0',
          }}
        >
          {sidebarType === SidebarType.AI ? <AI /> : MaterialStage}
          <SelectedArea />
        </div>
        <Detail />
      </div>
    </div>
  );
});
