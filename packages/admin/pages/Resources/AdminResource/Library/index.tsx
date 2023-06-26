import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Checkbox, Dropdown, Modal, Pagination, Spin, message, Popover } from 'antd';
import { DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IMaterial } from '@/types/library';
import { useBatchLibraryAction } from './useLibrary';
import RenameModal, { RenameModalProps } from '../Modal/RenameModal';
import UpdateTagModal, { UpdateTagModalProps } from '../Modal/UpdateTagModal';
import ModifyModal, { ModifyModalProps } from '../Modal/ModifyModal';
import BatchModifyTags, { BatchTagsProps } from '../Modal/BatchModifyTags';
import DetailModal from '../Modal/DetailModal';
import Item from './Item';
import emptyHolder from './emptyHolder.svg';
import styles from '../style';
export * from './useLibrary';
import { IframePreview, usePostMessage } from '@editor/Resource/Preview';
import UploadButton from './UploadButton';
declare const Laya: any;
Laya.init(0, 0);
document.body.style.overflow = 'auto';
export interface Props {
  page: number;
  pageSize: number;
  keyword: string;
  tagIds: [];
  types: string;
  total: number;
  list: IMaterial[];
  setMaterialList: React.Dispatch<React.SetStateAction<IMaterial[]>>;
  setTagIds: React.Dispatch<React.SetStateAction<[]>>;
  setTagNames: React.Dispatch<React.SetStateAction<[]>>;
  tagNames: [];
  onChange(partial: Record<string, unknown>): void;
  onRefetch: (resetPage?: boolean) => void;
  isFetching: boolean;
  categories:
    | {
        cid: number;
        name: string;
      }[]
    | undefined;
}

type ModalStatus = {
  detail: { visible: boolean; id: IMaterial['id'] | null };
  rename: { visible: boolean; items: RenameModalProps['items'] };
  updateTag: {
    visible: boolean;
    ids: UpdateTagModalProps['ids'];
    types: UpdateTagModalProps['types'];
    categories: UpdateTagModalProps['categories'];
  };
  modify: { visible: boolean; ids: ModifyModalProps['id']; item?: IMaterial };
  batchTags: { visible: boolean; items: BatchTagsProps['items'] };
};

type ModalType = 'detail' | 'rename' | 'updateTag' | 'modify' | 'batchTags';

const emptyWrapper = css({
  padding: '32px',
  height: '428px',
  textAlign: 'center',
});

export default function Library({
  page,
  pageSize,
  total,
  list,
  setTagIds,
  tagIds,
  setTagNames,
  tagNames,
  onChange,
  onRefetch,
  isFetching,
  types,
  categories,
}: Props) {
  const { onBatchDelete } = useBatchLibraryAction();
  const [info, setInfo] = useState<Record<IMaterial['id'], any>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clearIframe, postMessage } = usePostMessage(iframeRef);
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string>('');

  const [modalStatus, setModalStatus] = useState<ModalStatus>({
    detail: { visible: false, id: null },
    rename: { visible: false, items: [] },
    updateTag: { visible: false, ids: [], types: '', categories: [] },
    modify: { visible: false, ids: [] },
    batchTags: { visible: false, items: [] },
  });
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
      const nextInfo: Record<IMaterial['id'], any> = {};
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
  // 鼠标移入，预览开始
  const handlePreviewStart = (left: number, top: number, width: number, height: number, url: string, type: string) => {
    setLeft(left);
    setTop(top);
    setWidth(width);
    setVisible(true);
    if (type === 'Video') {
      setPreviewVideo(url);
    }
    if (iframeRef.current) {
      if (type === 'particle') {
        postMessage({
          type: 'change',
          url,
          projectType: type,
          width: width * 2,
          height: height * 2,
        });
      } else {
        postMessage({
          type: 'change',
          url,
          projectType: type,
        });
      }
    }
  };
  // 鼠标移出，预览结束
  const handlePreviewEnd = () => {
    setPreviewVideo('');
    setVisible(false);
    clearIframe();
  };

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
              if (selectedList.length === 0) {
                message.error('请勾选需要操作的素材');
                return;
              }
              setModalStatus(modal => {
                return {
                  ...modal,
                  ['updateTag']: {
                    ...modal['updateTag'],
                    visible: true,
                    ids: selectedList.map(item => item.id),
                    types: types,
                    categories: categories,
                  },
                };
              });
            }}
          >
            批量修改分类
          </div>
        ),
        key: 'tag',
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
                  ['batchTags']: { ...modal['batchTags'], visible: true, items: selectedList },
                };
              });
            }}
          >
            批量修改标签
          </div>
        ),
        key: 'platformTag',
      },
      {
        label: (
          <div
            onClick={() => {
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
                content: `您将删除${len}个物料`,
                okText: '确认',
                cancelText: '取消',
                onOk: () => {
                  onBatchDelete(selectedList.map(item => item.id)).then(() => {
                    message.success(`成功将${len}个物料删除`);
                    onRefetch();
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
  }, [types, selectedList, categories, onBatchDelete, onRefetch]);

  useEffect(() => {
    if (list) {
      setInfo(info => {
        const obj: Record<IMaterial['id'], any> = {};
        for (const item of list) {
          obj[item.id] = info[item.id] || { selected: false };
        }
        return obj;
      });
    }
  }, [list]);

  if (!list) {
    return (
      <div className={emptyWrapper}>
        <Spin size="large" spinning={true} />
      </div>
    );
  }

  return (
    <>
      {
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
                <Dropdown menu={{ items: multipleOptionMenu }} trigger={['click']}>
                  <Button className={styles.optionButton}>
                    <Popover
                      placement="bottom"
                      content={
                        <div style={{ fontSize: '12px' }}>
                          <div>"批量修改分类"操作前需选择素材类别</div>
                        </div>
                      }
                    >
                      <QuestionCircleOutlined className={styles.optionTipsTrigger} onClick={e => e.stopPropagation()} />
                    </Popover>
                    批量操作 <DownOutlined />
                  </Button>
                </Dropdown>
              </>
            )}
            <UploadButton onRefetch={onRefetch} />
          </div>
          <Spin size="large" spinning={isFetching}>
            {(list || []).length === 0 ? (
              <div className={emptyWrapper}>
                <img src={emptyHolder} />
                <p style={{ color: '#999' }}>该分类下暂无相关物料</p>
              </div>
            ) : (
              <>
                <div className={styles.list}>
                  {(list || []).map(item => {
                    return (
                      <Item
                        key={item.id}
                        item={item}
                        selected={info[item.id]?.selected ?? false}
                        onSelect={handleItemSelect}
                        tagIds={tagIds}
                        setTagIds={setTagIds}
                        tagNames={tagNames}
                        setTagNames={setTagNames}
                        onChange={onChange}
                        onFinishUpdate={() => {
                          onRefetch();
                        }}
                        onPreviewStart={handlePreviewStart}
                        handlePreviewEnd={handlePreviewEnd}
                        onShowModal={(modalType: ModalType, ids: IMaterial['id'][], item?: IMaterial) => {
                          setModalStatus(modal => {
                            return {
                              ...modal,
                              [modalType]: {
                                ...modal[modalType],
                                visible: true,
                                ...(modalType === 'detail' ? { id: ids[0] } : { ids, item }),
                              },
                            };
                          });
                        }}
                      />
                    );
                  })}
                  <div
                    style={{
                      left: `${left + 1}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: '209px',
                      position: 'absolute',
                      zIndex: 9,
                      visibility: visible ? 'visible' : 'hidden',
                      pointerEvents: 'none',
                    }}
                    onMouseLeave={handlePreviewEnd}
                  >
                    {previewVideo && (
                      <video
                        src={previewVideo}
                        style={{ position: 'absolute', zIndex: 10 }}
                        autoPlay={true}
                        loop
                        width={width}
                        height={209}
                      />
                    )}
                    <IframePreview ref={iframeRef} width={width} height={209} />
                  </div>
                </div>
                <div className={styles.pagination}>
                  <Pagination
                    current={page}
                    total={total}
                    showTotal={total => `共${total}条记录`}
                    defaultPageSize={pageSize}
                    defaultCurrent={page}
                    showSizeChanger
                    showQuickJumper
                    pageSizeOptions={['20', '60', '100']}
                    onChange={(page, pageSize) => {
                      onChange({ page, pageSize });
                    }}
                  />
                </div>
              </>
            )}
          </Spin>
        </>
      }

      {modalStatus.rename.visible && (
        <RenameModal items={modalStatus.rename.items} onCancel={handleCancelModal('rename')} onRefetch={onRefetch} />
      )}
      {modalStatus.updateTag.visible && (
        <UpdateTagModal
          ids={modalStatus.updateTag.ids}
          types={types}
          categories={categories}
          onCancel={handleCancelModal('updateTag')}
          onRefetch={onRefetch}
        />
      )}
      {modalStatus.batchTags.visible && (
        <BatchModifyTags
          items={modalStatus.batchTags.items}
          onCancel={handleCancelModal('batchTags')}
          onRefetch={onRefetch}
        />
      )}
      {modalStatus.modify.visible && (
        <ModifyModal
          id={modalStatus.modify.ids}
          item={modalStatus.modify.item}
          onCancel={handleCancelModal('modify')}
          onRefetch={onRefetch}
        />
      )}
      <DetailModal
        visible={modalStatus.detail.visible}
        id={modalStatus.detail.id}
        onCancel={handleCancelModal('detail')}
        onRefetch={onRefetch}
      />

      {/* <CustomDragLayer /> */}
    </>
  );
}
