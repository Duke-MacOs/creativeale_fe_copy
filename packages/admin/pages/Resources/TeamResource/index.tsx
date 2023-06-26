import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tabs } from 'antd';
import Filter from './Filter';
import Categories, { useCategoryList } from './Categories';
import Library, { useLibrary } from './Library';
import { UserMaterialContext } from './context';
import styles from './style';
import { IPageParams, usePageParams } from '@main/routes/withPath';
import { theme } from 'antd';
import { css, cx } from 'emotion';
import StoreMaterial from '../Store';
import { useState } from 'react';
export interface ITeamResourceParams extends IPageParams {
  keyword: string;
  teamId: string;
  types: string;
  categoryId: string;
}

const UserMaterial = () => {
  const {
    list: categoryList,
    fetchList: fetchCategoryList,
    onAddCategory,
    onCancelAddCategory,
  } = useCategoryList(true);
  const { params, onParamsChange } = usePageParams<ITeamResourceParams>();
  const { loading, list: library, total, fetchList: fetchLibrary, setList } = useLibrary(params);
  const { categoryId: activeCategoryId, keyword, types } = params;
  const { token } = theme.useToken();
  return (
    <UserMaterialContext.Provider
      value={{
        category: {
          list: categoryList,
          activeCategoryId,
          refreshList: fetchCategoryList,
          addCategory: onAddCategory,
          cancelAddCategory: onCancelAddCategory,
        },
        library: { loading, list: library, total, refreshList: fetchLibrary },
      }}
    >
      <div
        className={cx(
          styles.wrapper,
          css({
            background: token.colorBgContainer,
          })
        )}
      >
        <Filter keyword={keyword} types={types} onChange={onParamsChange} />
        <div className={styles.container}>
          <DndProvider backend={HTML5Backend}>
            <div className={styles.content}>
              <div className={styles.sidebarWrapper}>
                <Categories
                  active={activeCategoryId}
                  editable={true}
                  onChange={categoryId => {
                    onParamsChange({ categoryId });
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Library setList={setList} pagination={params} onPaginationUpdate={onParamsChange} />
              </div>
            </div>
          </DndProvider>
        </div>
      </div>
    </UserMaterialContext.Provider>
  );
};

export default () => {
  const [activeKey, setActiveKey] = useState('1');
  return (
    <Tabs style={{ padding: '0 10px', flex: '1' }} defaultActiveKey={activeKey} onChange={setActiveKey}>
      <Tabs.TabPane tab="团队管理" key="1">
        <UserMaterial />
      </Tabs.TabPane>
      <Tabs.TabPane tab="商城管理" key="2">
        <StoreMaterial type="admin" visible={activeKey === '2'} />
      </Tabs.TabPane>
    </Tabs>
  );
};
