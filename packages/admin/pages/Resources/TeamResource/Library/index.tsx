import React, { useState, useMemo, useEffect, useContext, useRef } from 'react';
import { Button, Checkbox, Menu, Dropdown, Modal, Pagination, Spin, message } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { isNil } from 'lodash';
import { IUserMaterial } from '@/types/library';
import { UserMaterialContext } from '../context';
import { useBatchLibraryAction } from './useLibrary';
import UpdateCategoryModal, { UpdateCategoryModalProps } from '../Modal/UpdateCategoryModal';
import RenameModal, { RenameModalProps } from '../Modal/RenameModal';
import StoreMaterialModal from '../../Store/Modal/MaterialModal';
import UploadButton from '../../AdminResource/Library/UploadButton';
import { EmptyHolder } from '@main/pages/views';
import DetailModal from '../Modal/DetailModal';
import Item from './Item';
import styles from '../style';
import { useUserInfo } from '@shared/userInfo';
import { IParamsContext } from '@main/routes/withPath';
import { IframePreview, usePostMessage } from '@editor/Resource/Preview';

export * from './useLibrary';
declare const Laya: any;
Laya.init(0, 0);
document.body.style.overflow = 'auto';
interface Props {
  pagination: { page: number; pageSize: number };
  onPaginationUpdate: IParamsContext['onParamsChange'];
  setList: React.Dispatch<React.SetStateAction<IUserMaterial[] | null>>;
}

type ModalStatus = {
  updateCat: { visible: boolean; ids: UpdateCategoryModalProps['ids'] };
  detail: { visible: boolean; id: IUserMaterial['id'] | null };
  rename: { visible: boolean; items: RenameModalProps['items'] };
  apply: { visible: boolean; id: IUserMaterial['id'] };
};

type ModalType = 'updateCat' | 'detail' | 'rename' | 'apply';

const emptyWrapper = css({
  padding: '32px',
  height: '428px',
  textAlign: 'center',
});

export default function Library({ pagination, onPaginationUpdate, setList }: Props) {
  const {
    userInfo: { teamId },
  } = useUserInfo();
  const {
    category: { list: categoryList, activeCategoryId, refreshList: refreshCategory },
    library: { loading, list, total, refreshList },
  } = useContext(UserMaterialContext);
  const category = categoryList && activeCategoryId ? categoryList.find(cat => cat.id === activeCategoryId) : null;
  const { onBatchDelete, onBatchRestore, onBatchClean } = useBatchLibraryAction();
  const [info, setInfo] = useState<Record<IUserMaterial['id'], any>>({});
  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    updateCat: { visible: false, ids: [] },
    detail: { visible: false, id: null },
    rename: { visible: false, items: [] },
    apply: { visible: false, id: '' },
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clearIframe, postMessage } = usePostMessage(iframeRef);
  const [effectPreview, setEffectPreview] = useState({ width: 0, height: 0, left: 0, top: 0, visible: false });
  useEffect(() => {
    if (pagination.page !== 1 && list?.length === 0) {
      onPaginationUpdate({ ...pagination, page: pagination.page - 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);
  const selectedList = useMemo(() => {
    return (list || []).filter(item => info[item.id]?.selected);
  }, [info, list]);
  const allSelected = selectedList.length === (list && list.length);

  const handleItemSelect = usePersistCallback((id, selected) => {
    setInfo(info => ({ ...info, [id]: { ...info[id], selected } }));
  });
  const handleSelectAll = usePersistCallback((e: CheckboxChangeEvent) => {
    const { checked } = e.target;
    setInfo(info => {
      const nextInfo: Record<IUserMaterial['id'], any> = {};
      list?.forEach(item => {
        nextInfo[item.id] = { ...info[item.id], selected: checked };
      });
      return nextInfo;
    });
  });
  const handleCancelModal = usePersistCallback((modalType: ModalType) => {
    return () => {
      setModalStatus(modal => {
        return {
          ...modal,
          [modalType]: { ...modal[modalType], visible: false },
        };
      });
    };
  });

  const multipleOptionMenu = useMemo(() => {
    return [
      {
        label: (
          <div
            onClick={() => {
              if (selectedList.length === 0) {
                message.error('请勾选需要操作的素材');
                return;
              }
              setModalStatus(modal => {
                return {
                  ...modal,
                  ['updateCat']: { ...modal['updateCat'], visible: true, ids: selectedList.map(item => item.id) },
                };
              });
            }}
          >
            批量修改分类
          </div>
        ),
        key: 'cat',
      },
      {
        label: (
          <div
            onClick={() => {
              if (selectedList.length === 0) {
                message.error('请勾选需要操作的素材');
                return;
              }
              setModalStatus(modal => {
                return {
                  ...modal,
                  ['rename']: { ...modal['rename'], visible: true, items: selectedList },
                };
              });
            }}
          >
            批量重命名
          </div>
        ),
        key: 'rename',
      },
      {
        label: (
          <div
            onClick={() => {
              const effectOther = selectedList.find(item => item.categories.length > 1);
              const len = selectedList.length;
              if (len === 0) {
                message.error('请勾选需要操作的素材');
                return;
              }
              Modal.confirm({
                className: styles.modalWrapper,
                title: '删除物料',
                icon: null,
                centered: true,
                closable: true,
                content: effectOther ? '部分物料属于多个分类，删除后同时会从其他分类下消失' : `您将删除${len}个物料`,
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  onBatchDelete(selectedList.map(item => item.id)).then(() => {
                    message.success(`成功将${len}个物料删除`);
                    refreshList();
                    refreshCategory();
                  });
                },
              });
            }}
          >
            批量删除
          </div>
        ),
        key: 'delete',
      },
    ];
  }, [selectedList, onBatchDelete, refreshCategory, refreshList]);

  const recycleOptionMenu = useMemo(() => {
    return [
      {
        label: (
          <div
            onClick={() => {
              onBatchRestore(selectedList.map(item => item.id)).then(() => {
                const len = selectedList.length;
                message.success(`成功将${len}个物料还原`);
                refreshCategory();
                refreshList();
              });
            }}
          >
            批量还原
          </div>
        ),
        key: 'revert',
      },
      {
        label: (
          <div
            onClick={() => {
              onBatchClean(selectedList.map(item => item.id)).then(() => {
                const len = selectedList.length;
                message.success(`成功将${len}个物料清理`);
                refreshCategory();
                refreshList();
              });
            }}
          >
            批量清理
          </div>
        ),
        key: 'clear',
      },
    ];
  }, [onBatchRestore, selectedList, refreshCategory, refreshList, onBatchClean]);

  useEffect(() => {
    if (list) {
      setInfo(info => {
        const obj: Record<IUserMaterial['id'], any> = {};
        for (const item of list) {
          obj[item.id] = info[item.id] || { selected: false };
        }
        return obj;
      });
    }
  }, [list]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pagination]);

  if (!(list && category)) {
    return (
      <div className={emptyWrapper}>
        <Spin size="large" spinning={true} />
      </div>
    );
  }
  const handlePreviewStart = (left: number, top: number, width: number, height: number, url: string, type: string) => {
    setEffectPreview({ width, height, left, top, visible: true });
    console.log('1!:', {
      type: 'change',
      url,
      projectType: type,
    });
    if (iframeRef.current) {
      postMessage({
        type: 'change',
        url,
        projectType: type,
      });
    }
  };
  // 鼠标移出，预览结束
  const handlePreviewEnd = () => {
    setEffectPreview(prev => ({ ...prev, visible: false }));
    clearIframe();
  };
  return (
    <>
      {category && (
        <>
          <div className={styles.optionBar}>
            {(list || []).length > 0 && (
              <>
                <Checkbox
                  className={styles.optionCheckbox}
                  checked={allSelected}
                  indeterminate={selectedList.length > 0 && !allSelected}
                  onChange={handleSelectAll}
                >
                  全选
                </Checkbox>
                {category.id === '0' ? (
                  <Dropdown menu={{ items: recycleOptionMenu }} trigger={['click']}>
                    <Button className={styles.optionButton}>
                      批量操作 <DownOutlined />
                    </Button>
                  </Dropdown>
                ) : (
                  <Dropdown menu={{ items: multipleOptionMenu }} trigger={['click']}>
                    <Button className={styles.optionButton}>
                      批量操作 <DownOutlined />
                    </Button>
                  </Dropdown>
                )}
              </>
            )}
            <UploadButton
              teamId={teamId}
              categoryId={activeCategoryId || ''}
              onRefetch={() => {
                refreshCategory();
                refreshList();
              }}
            />
          </div>
          <Spin size="large" spinning={loading}>
            {(list || []).length === 0 ? (
              <EmptyHolder message="该分类下暂无相关物料" />
            ) : (
              <>
                <div className={styles.list}>
                  {(list || []).map(item => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        category={category}
                        list={list}
                        setList={setList}
                        selected={info[item.id]?.selected ?? false}
                        onSelect={handleItemSelect}
                        onPreviewStart={handlePreviewStart}
                        handlePreviewEnd={handlePreviewEnd}
                        onFinishUpdate={() => {
                          refreshList();
                          refreshCategory();
                        }}
                        onShowModal={(modalType: ModalType, ids: IUserMaterial['id'][]) => {
                          setModalStatus(modal => {
                            return {
                              ...modal,
                              [modalType]: {
                                ...modal[modalType],
                                visible: true,
                                ...(['detail', 'apply'].includes(modalType) ? { id: ids[0] } : { ids }),
                              },
                            };
                          });
                        }}
                      />
                    );
                  })}
                  <div
                    style={{
                      left: `${effectPreview.left + 1}px`,
                      top: `${effectPreview.top}px`,
                      width: `${effectPreview.width}px`,
                      height: '209px',
                      position: 'absolute',
                      zIndex: 9,
                      visibility: effectPreview.visible ? 'visible' : 'hidden',
                      pointerEvents: 'none',
                    }}
                    onMouseLeave={handlePreviewEnd}
                  >
                    <IframePreview ref={iframeRef} width={effectPreview.width} height={209} />
                  </div>
                </div>
                <div className={styles.pagination}>
                  <Pagination
                    current={pagination.page}
                    total={total}
                    showTotal={total => `共${total}条记录`}
                    defaultPageSize={pagination.pageSize}
                    defaultCurrent={pagination.page}
                    showSizeChanger
                    showQuickJumper
                    pageSizeOptions={['20', '60', '100']}
                    onChange={(page, pageSize) => {
                      const partial: Record<string, number> = {};
                      if (page !== pagination.page) {
                        partial.page = page;
                      }
                      if (!isNil(pageSize) && pageSize !== pagination.pageSize) {
                        partial.pageSize = pageSize;
                        partial.page = 1;
                      }
                      onPaginationUpdate(partial, { resetPage: false });
                    }}
                  />
                </div>
              </>
            )}
          </Spin>
        </>
      )}

      {modalStatus.updateCat.visible && (
        <UpdateCategoryModal ids={modalStatus.updateCat.ids} onCancel={handleCancelModal('updateCat')} />
      )}
      {modalStatus.rename.visible && (
        <RenameModal items={modalStatus.rename.items} onCancel={handleCancelModal('rename')} />
      )}
      {modalStatus.apply.visible && (
        <StoreMaterialModal id={'' + modalStatus.apply.id} type="examine" onCancel={handleCancelModal('apply')} />
      )}
      <DetailModal
        visible={modalStatus.detail.visible}
        id={modalStatus.detail.id}
        onCancel={handleCancelModal('detail')}
      />
    </>
  );
}
