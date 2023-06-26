import React, { useState, useRef } from 'react';
import { Button, Checkbox, Popover, message, Input, Tag } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { IMaterial } from '@/types/library';
import MaterialCover from '@shared/components/MaterialCover';
import { useBatchLibraryAction, useLibraryItem } from './useLibrary';
import styles from '../style';
import { Category2PlayType } from '@shared/config';
import { ClockCircleOutlined, EllipsisOutlined } from '@ant-design/icons';
import Axios from 'axios';
import { downloadBlob } from '@editor/utils';

interface ItemProps {
  item: IMaterial;
  selected: boolean;
  onSelect(id: IMaterial['id'], checked: boolean): void;
  onFinishUpdate(resetPage?: boolean): void;
  onShowModal(type: ModalType, ids: IMaterial['id'][], item?: IMaterial): void;
  onPreviewStart: (left: number, top: number, width: number, height: number, url: string, type: string) => void;
  handlePreviewEnd: () => void;
  tagIds: [];
  setTagIds: React.Dispatch<React.SetStateAction<[]>>;
  setTagNames: React.Dispatch<React.SetStateAction<[]>>;
  tagNames: [];
  onChange(partial: Record<string, unknown>): void;
}
type ModalType = 'detail' | 'rename' | 'updateTag' | 'modify';
export enum Status {
  // 审核通过 = 1,  审核通过的状态不用显示
  已删除 = 2,
  不可用 = 3,
  待审核 = 4,
  未上架 = 5,
  审核不通过 = 6,
}
const color = ['gold', 'green', 'purple'];
export default function Item({
  item,
  selected,
  onSelect,
  onShowModal,
  onFinishUpdate,
  onPreviewStart,
  handlePreviewEnd,
  setTagIds,
  tagIds,
  setTagNames,
  tagNames,
  onChange,
}: ItemProps) {
  const [hover, setHover] = useState(false);
  const [ifHidden, setIfHidden] = useState(true);
  const [newName, setNewName] = useState('');
  const refInput = React.useRef<any>(null);
  const copyRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLInputElement | null>(null);
  const { onReview } = useLibraryItem(item.id);
  const { onBatchUpdate } = useBatchLibraryAction();
  const { previewUrl, type } = item;
  const tags = item.tags?.filter(i => i.origin !== 1) ?? [];
  const handleCopyId = usePersistCallback(() => {
    if (copyRef.current) {
      copyRef.current.value = String(item.id);
      copyRef.current.select();
      document.execCommand('Copy');
      message.info('复制成功');
    }
  });
  const handleMouseEnterItem = usePersistCallback(e => {
    setHover(true);
    const { offsetLeft: left, offsetTop: top, clientWidth: width, clientHeight: height } = e.currentTarget;
    if (
      item.type.name !== '视频' &&
      item.type.name !== '音频' &&
      item.type.name !== '图片' &&
      item.type.name !== '字体'
    ) {
      if (item.extra?.previewVideo) {
        const previewVideo = item.extra?.previewVideo;
        onPreviewStart(left, top, width, height, previewVideo, 'Video');
      } else {
        onPreviewStart(left, top, width, height, previewUrl, Category2PlayType[type.cid]);
      }
    }
  });
  const handleMouseLeaveItem = usePersistCallback(() => {
    setHover(false);
    handlePreviewEnd();
  });
  const rename = (id: string | number) => {
    onBatchUpdate([{ id: id, name: newName }]).then(() => {
      onFinishUpdate(false);
      message.success('重命名成功');
      setIfHidden(true);
    });
  };

  // 下载素材
  const download = (url: string, name: string) => {
    const index = url.lastIndexOf('.');
    let ext = '';
    ext = url.substr(index + 1);
    if (url.includes('zip')) {
      ext = 'zip';
    }
    Axios({ url: `${url}?forceDownload=true`, responseType: 'blob' }).then(res => {
      downloadBlob(res.data, `${name}.${ext}`);
    });
  };
  return (
    <div className={styles.item} onMouseEnter={e => handleMouseEnterItem(e)} onMouseLeave={handleMouseLeaveItem}>
      <div ref={wrapperRef} className={styles.itemPreview}>
        <MaterialCover data={item} CoverBoxRef={wrapperRef} />
        {item.tags?.filter(item => item.origin === 1) === undefined ||
        item.tags?.filter(item => item.origin === 1).length === 0 ? (
          <div className={styles.itemCatTag}>{item.type.name}</div>
        ) : (
          <div className={styles.itemCatTag}>
            {item.type.name}-{item.tags?.filter(item => item.origin === 1)[0]?.name}
          </div>
        )}
        {item.status !== 1 && <div className={styles.statusTag}>{Status[item.status]}</div>}
        {item.status === 1 && (
          <div
            className={styles.statusTag}
            style={{ backgroundColor: item.onPlatform === false ? '#D395E0' : 'green' }}
          >
            {item.onPlatform === false ? '待上架' : '已上架'}
          </div>
        )}
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
            {item.status === 4 && (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    onReview({ ids: [item.id], status: 1 }).then(() => {
                      onFinishUpdate(false);
                    });
                  }}
                >
                  通过
                </Button>
                <Button
                  type="link"
                  onClick={() => {
                    onReview({ ids: [item.id], status: 6 }).then(() => {
                      onFinishUpdate(false);
                    });
                  }}
                >
                  拒绝
                </Button>
              </>
            )}
            {item.onPlatform === true && item.status === 1 && (
              <Button
                type="link"
                onClick={() => {
                  onReview({ ids: [item.id], onPlatform: false }).then(() => {
                    onFinishUpdate(false);
                  });
                }}
              >
                下架
              </Button>
            )}
            {item.onPlatform === false && item.status === 1 && (
              <Button
                type="link"
                onClick={() => {
                  onReview({ ids: [item.id], onPlatform: true }).then(() => {
                    onFinishUpdate(false);
                  });
                }}
              >
                上架
              </Button>
            )}
            <Button type="link" onClick={() => onShowModal('modify', [item.id], item)}>
              修改
            </Button>
            <Button type="link" onClick={() => onShowModal('detail', [item.id], item)}>
              详情
            </Button>
            {item.type.name === '互动组件' && (
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
            {!['场景', '脚本'].includes(item.type.name) && (
              <Button
                type="link"
                onClick={() => {
                  download(item.url, item.name);
                }}
              >
                下载
              </Button>
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

        <Input
          className={styles.editItemName}
          ref={refInput}
          type="text"
          defaultValue={item.name}
          autoFocus
          onChange={e => {
            setNewName(e.target.value);
          }}
          onBlur={e => {
            e.target.value !== item.name ? rename(item.id) : setIfHidden(true);
          }}
          onPressEnter={e => {
            e.currentTarget.value !== item.name ? rename(item.id) : setIfHidden(true);
          }}
          hidden={ifHidden}
        />
        <Popover content={item.name}>
          <div
            hidden={!ifHidden}
            className={styles.itemName}
            onDoubleClick={() => {
              setIfHidden(false);
              setTimeout(() => {
                refInput.current!.focus();
              }, 100);
            }}
          >
            {item.name}
          </div>
        </Popover>

        <div className={styles.itemTags}>
          {tags.length !== 0 ? (
            tags.length > 3 ? (
              <>
                {tags.slice(0, 3).map((tag, index) => {
                  return (
                    <Tag
                      color={color[index]}
                      key={tag.id}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => {
                        setTagIds([...tagIds, tag.id] as any);
                        onChange({ tagIds: [...tagIds, tag.id] });
                        setTagNames([...tagNames, tag.name] as any);
                      }}
                    >
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
                          <span
                            key={tag.id}
                            style={{ width: '100px', padding: '5px', cursor: 'pointer' }}
                            onClick={() => {
                              setTagIds([...tagIds, tag.id] as any);
                              onChange({ tagIds: [...tagIds, tag.id] });
                              setTagNames([...tagNames, tag.name] as any);
                            }}
                          >
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
              tags.map((tag, index) => {
                return (
                  <Tag
                    color={color[index]}
                    key={tag.id}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      setTagIds([...tagIds, tag.id] as any);
                      onChange({ tagIds: [...tagIds, tag.id] });
                      setTagNames([...tagNames, tag.name] as any);
                    }}
                  >
                    {tag.name}
                  </Tag>
                );
              })
            )
          ) : (
            <Tag icon={<ClockCircleOutlined />} color="default">
              暂无平台标签
            </Tag>
          )}
        </div>
        <input className={styles.copyInput} type="text" ref={copyRef} value={item.id} readOnly />
      </div>
    </div>
  );
}
