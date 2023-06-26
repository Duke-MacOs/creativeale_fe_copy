import React, { useState, useRef } from 'react';
import { Button, Checkbox, Dropdown, Modal, Popover, message } from 'antd';
import { useDrag } from 'react-dnd';
import { usePersistCallback } from '@byted/hooks';
import { IUserMaterial } from '@/types/library';
import MaterialCover from '@shared/components/MaterialCover';
import { ICategoryItem } from '../Categories/useCategory';
import { useLibraryItem } from './useLibrary';
import styles from '../style';
import { CategoryLevel1 } from '@shared/types/store';
import { isResourceEffect } from '@shared/utils/resource';
import { Category2PlayType } from '@shared/config';

interface ItemProps {
  item: IUserMaterial;
  list: IUserMaterial[];
  category: ICategoryItem;
  selected: boolean;
  onPreviewStart: (left: number, top: number, width: number, height: number, url: string, type: string) => void;
  handlePreviewEnd: () => void;
  onSelect(id: IUserMaterial['id'], checked: boolean): void;
  onFinishUpdate(): void;
  setList: React.Dispatch<React.SetStateAction<IUserMaterial[] | null>>;
  onShowModal(type: ModalType, ids: IUserMaterial['id'][]): void;
}

type ModalType = 'updateCat' | 'detail' | 'rename' | 'apply';

export default function Item({
  item,
  selected,
  category,
  onSelect,
  onShowModal,
  onFinishUpdate,
  onPreviewStart,
  handlePreviewEnd,
}: ItemProps) {
  const [hover, setHover] = useState(false);
  const copyRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLInputElement | null>(null);
  const { onDelete, onRestore, onClean, onRemoveFromCategory } = useLibraryItem(item.id);
  const [, dragRef] = useDrag({
    item: { type: 'resource', item, sourceCategoryId: category.id, sourceDragger: wrapperRef },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleMouseEnterItem = usePersistCallback(e => {
    setHover(true);
    const { offsetLeft: left, offsetTop: top, clientWidth: width, clientHeight: height } = e.currentTarget;
    if (
      ![CategoryLevel1.Video, CategoryLevel1.Audio, CategoryLevel1.Image, CategoryLevel1.Text].includes(item.type.cid)
    ) {
      if (item.extra?.previewVideo) {
        const previewVideo = item.extra?.previewVideo;
        onPreviewStart(left, top, width, height, previewVideo, 'Video');
      } else {
        isResourceEffect({ id: item.type.cid }) &&
          onPreviewStart(left, top, width, height, item.previewUrl, Category2PlayType[item.type.cid]);
      }
    }
  });

  const handleMouseLeaveItem = usePersistCallback(() => {
    setHover(false);
    handlePreviewEnd();
  });

  const handleDelete = usePersistCallback(() => {
    const effectOther = item.categories.length > 1;
    Modal.confirm({
      className: styles.modalWrapper,
      title: '删除物料',
      icon: null,
      centered: true,
      closable: true,
      content: effectOther ? '该物料属于多个分类，删除后同时会从其他分类下消失' : `您将删除“${item.name}”`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        onDelete().then(() => {
          onFinishUpdate();
          message.success(`成功删除“${item.name}”`);
        });
      },
    });
  });
  const handleCopyId = usePersistCallback(() => {
    if (copyRef.current) {
      copyRef.current.value = String(item.id);
      copyRef.current.select();
      document.execCommand('Copy');
      message.info('复制成功');
    }
  });
  const menu = [
    {
      label: (
        <div
          onClick={() => {
            onRemoveFromCategory([category.id as string]).then(() => {
              onFinishUpdate();
              message.success(`成功将物料从${category.name}中移除`);
            });
          }}
        >
          从分类中移除
        </div>
      ),
      key: 'remove',
    },
    {
      label: <div onClick={handleDelete}>删除</div>,
      key: 'delete',
    },
  ];

  return (
    <div ref={dragRef} className={styles.item} onMouseEnter={handleMouseEnterItem} onMouseLeave={handleMouseLeaveItem}>
      <div ref={wrapperRef} className={styles.itemPreview}>
        <MaterialCover data={item} CoverBoxRef={wrapperRef} />
        <div className={styles.itemTag}>{item.type.name}</div>
        <Checkbox
          className={styles.itemCheckbox}
          checked={selected}
          onChange={e => {
            const { checked } = e.target;
            onSelect(item.id, checked);
          }}
        />
        {hover && (
          <div className={styles.itemOptions}>
            {category.id === '0' ? (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    onRestore().then(() => {
                      onFinishUpdate();
                      message.success(`成功将物料还原`);
                    });
                  }}
                >
                  还原
                </Button>
                <Button
                  type="link"
                  onClick={() => {
                    onClean().then(() => {
                      onFinishUpdate();
                      message.success(`成功将物料清理`);
                    });
                  }}
                >
                  清理
                </Button>
              </>
            ) : (
              <>
                <Button type="link" onClick={() => onShowModal('updateCat', [item.id])}>
                  修改分类
                </Button>
                <Button type="link" onClick={() => onShowModal('detail', [item.id])}>
                  详情
                </Button>
                <Button type="link" onClick={() => onShowModal('apply', [item.id])}>
                  发布
                </Button>
                {['全部', '未分类'].includes(category.name) ? (
                  <Button type="link" onClick={handleDelete}>
                    删除
                  </Button>
                ) : (
                  <Dropdown menu={{ items: menu }} trigger={['hover']}>
                    <Button type="link">更多</Button>
                  </Dropdown>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div className={styles.itemFooter}>
        <Popover
          content={
            <div className={styles.itemIdTips}>
              <span>物料ID: {item.id}</span>
              <Button size="small" type="link" onClick={handleCopyId}>
                复制
              </Button>
            </div>
          }
        >
          <div className={styles.itemId}>ID</div>
        </Popover>
        <Popover content={item.name}>
          <div className={styles.itemName}>{item.name}</div>
        </Popover>
        <input className={styles.copyInput} type="text" ref={copyRef} value={item.id} readOnly />
      </div>
    </div>
  );
}
