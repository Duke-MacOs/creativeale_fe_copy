import React, { useState, useRef } from 'react';
import { Button, Checkbox, Popover, message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import MaterialCover from '@shared/components/MaterialCover';
import styles from '../style';
import { Category2PlayType } from '@shared/config';
import { CategoryLevel1, IStoreMaterial, StoreMaterialStatus, StoreMaterialStatusName } from '@shared/types/store';
import { ModalType } from '.';
import { updateMaterialById } from '@shared/api/store';
import { getStatusTagColor } from '..';
import { isResourceEffect } from '@shared/utils/resource';

interface ItemProps {
  item: IStoreMaterial;
  selected: boolean;
  onSelect(id: IStoreMaterial['id'], checked: boolean): void;
  onShowModal(type: ModalType, ids: string[], item?: IStoreMaterial): void;
  onPreviewStart: (left: number, top: number, width: number, height: number, url: string, type: string) => void;
  handlePreviewEnd: () => void;
  onRefetch?: () => void;
}

export default function Item({
  item,
  selected,
  onSelect,
  onShowModal,
  onPreviewStart,
  handlePreviewEnd,
  onRefetch,
}: ItemProps) {
  const [hover, setHover] = useState(false);
  const copyRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLInputElement | null>(null);
  const { previewUrl, type } = item;
  const tags = [];
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
        isResourceEffect({ id: type.cid }) &&
          onPreviewStart(left, top, width, height, previewUrl, Category2PlayType[type.cid]);
      }
    }
  });
  const handleMouseLeaveItem = usePersistCallback(() => {
    setHover(false);
    handlePreviewEnd();
  });
  const handleCopyId = usePersistCallback(() => {
    if (copyRef.current) {
      copyRef.current.value = String(item.id);
      copyRef.current.select();
      document.execCommand('Copy');
      message.info('复制成功');
    }
  });

  return (
    <div className={styles.item} onMouseEnter={e => handleMouseEnterItem(e)} onMouseLeave={handleMouseLeaveItem}>
      <div ref={wrapperRef} className={styles.itemPreview}>
        <MaterialCover data={item} CoverBoxRef={wrapperRef} />
        <div className={styles.itemCatTag}>{item.type.name}</div>
        <div className={styles.statusTag} style={{ backgroundColor: getStatusTagColor(item.status) }}>
          {StoreMaterialStatusName[item.status]}
        </div>
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
            {item.status === StoreMaterialStatus.shelve && (
              <Button
                type="link"
                onClick={async () => {
                  try {
                    await updateMaterialById(item.id, { status: StoreMaterialStatus.offShelve });
                    onRefetch?.();
                  } catch (error) {
                    message.error(error.message);
                  }
                }}
              >
                下架
              </Button>
            )}
            {item.status === StoreMaterialStatus.offShelve && (
              <Button
                type="link"
                onClick={async () => {
                  try {
                    await updateMaterialById(item.id, { status: StoreMaterialStatus.shelve });
                    onRefetch?.();
                  } catch (error) {
                    message.error(error.message);
                  }
                }}
              >
                上架
              </Button>
            )}
            <Button type="link" onClick={() => onShowModal('detail', [item.id], item)}>
              详情
            </Button>
            {item.type.cid === CategoryLevel1.Component2D && (
              <Button
                type="link"
                onClick={() => {
                  const url = new URL(location.href);
                  url.pathname = `/play/component`;
                  url.search = `?url=${item.previewUrl}`;
                  location.href = url.href;
                }}
              >
                查看
              </Button>
            )}
          </div>
        )}
      </div>
      <div className={styles.itemFooter}>
        {/* 标签 */}
        {/* <div className={styles.itemTags}>
          {tags.length !== 0 ? (
            <>
              {tags.slice(0, 3).map((tag, index) => {
                return (
                  <Tag color={color[index]} key={tag.id} style={{ border: 'none', cursor: 'pointer' }}>
                    {tag.name}
                  </Tag>
                );
              })}
              <Popover
                title="平台标签"
                content={
                  <div style={{ width: '200px', display: 'flex', flexWrap: 'wrap' }}>
                    {tags.map(tag => {
                      return (
                        <span key={tag.id} style={{ width: '100px', padding: '5px', cursor: 'pointer' }}>
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                }
                trigger="hover"
              >
                <Tag
                  icon={<EllipsisOutlined />}
                  color="default"
                  style={{ border: 'none', width: '25px', position: 'absolute', right: '0' }}
                />
              </Popover>
            </>
          ) : (
            <Tag icon={<ClockCircleOutlined />} color="default">
              暂无平台标签
            </Tag>
          )}
        </div> */}
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
        <input className={styles.copyInput} type="text" ref={copyRef} value={item.id} readOnly />
      </div>
    </div>
  );
}
