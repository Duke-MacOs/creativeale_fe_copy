import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message, Divider, Checkbox, Popover, Tag } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IUserMaterial } from '@/types/library';
import MaterialCover from '@shared/components/MaterialCover';
import styles from '../style';
import getTreeData from './convertData';
import { batchTag, fetchAllMaterialTag } from '@shared/api/library';
import { CheckOutlined, CloseOutlined, EditTwoTone } from '@ant-design/icons';

const innerStyles = {
  header: css({
    display: 'flex',
    backgroundColor: '#f8f9fa',
    lineHeight: '50px',
  }),
  col1: css({
    textAlign: 'center',
    flex: '0 0 200px',
  }),
  col2: css({
    paddingLeft: '100px',
    flex: 1,
  }),
  content: css({
    height: '600px',
    width: '850px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'row',
  }),
  tags: css({
    width: '500px',
    height: '600px',
    display: 'flex',
    border: '1px solid #e8e8e8',
    marginLeft: '300px',
    marginTop: '10px',
    position: 'absolute',
  }),
  contentRow: css({
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    borderBottom: '1px solid #e4e9ed',
    '&:last-child': {
      borderBottom: 0,
    },
  }),
};

export interface BatchTagsProps {
  items: IUserMaterial[];
  onCancel(): void;
  onRefetch: (resetPage?: boolean | undefined) => void;
}

export default function BatchModifyTags({ items, onCancel, onRefetch }: BatchTagsProps) {
  const [tagList, setTagList] = useState([]);
  const [cur, setCur] = useState('1');
  const [editId, setEditId] = useState(-1);
  const [allTags, setAllTags] = useState([]);
  const [curTags, setCurTags] = useState(allTags);
  const [batchTags, setBatchTags] = useState<{ id: number; tagIds: string[]; onPlatform: boolean }[]>([]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [saving, setSaving] = useState(false);
  const handleCancel = usePersistCallback(() => {
    onCancel();
  });

  // 获取每个素材已经选择的标签名称
  const getTagNames = (id: string | number) => {
    const index = batchTags.findIndex(tag => tag.id == id);
    const tagIds = batchTags[index]?.tagIds;
    const tagNames = [] as any;
    tagIds?.forEach(tagId => {
      const i = tagList.findIndex((tag: any) => tag.id === tagId);
      tagNames.push((tagList[i] as any).name);
    });
    return tagNames;
  };

  const handleConfirm = usePersistCallback(() => {
    setSaving(true);
    batchTag(batchTags)
      .then(data => {
        if (data.message === 'success') {
          message.success(`批量修改标签成功`);
          onRefetch();
        } else {
          message.error(`${data.message}`);
        }
      })
      .catch(() => message.error(`批量修改标签失败`));

    setSaving(false);

    onCancel();
  });
  useEffect(() => {
    fetchAllMaterialTag({ onPlatform: true }).then(data => {
      setTagList(data.tags);
    });
  }, []);

  return (
    <Modal
      title="批量修改标签"
      width={900}
      open={true}
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterTips}>您将修改{items.length}个资源的标签</div>
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" loading={saving} onClick={handleConfirm}>
            确认
          </Button>
        </div>
      }
      onOk={handleConfirm}
      onCancel={handleCancel}
    >
      <div className={innerStyles.header}>
        <div className={innerStyles.col1}>素材样式</div>
        <div className={innerStyles.col2}>选择标签</div>
      </div>
      <div className={innerStyles.content}>
        <div>
          <div className={innerStyles.contentRow} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <div className={innerStyles.col1} ref={wrapperRef} style={{ height: '100px', lineHeight: '100px' }}>
              全部
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '0px' }}>
              {editId !== 0 && <EditTwoTone onClick={() => setEditId(0)} style={{ fontSize: '17px' }} />}
              {editId === 0 && (
                <CloseOutlined
                  style={{ color: 'red', fontSize: '17px' }}
                  onClick={() => {
                    setEditId(-1);
                    setAllTags([]);
                  }}
                />
              )}
              {editId === 0 && (
                <CheckOutlined
                  style={{ color: '#349cfc', fontSize: '17px', marginLeft: '20px' }}
                  onClick={() => {
                    setEditId(-1);
                    setCurTags(allTags);
                    items.forEach(item => {
                      batchTags.push({ id: item.id as any, tagIds: allTags, onPlatform: true });
                    });
                  }}
                />
              )}
            </div>
          </div>
          {items.map(item => {
            return (
              <div key={item.id} className={innerStyles.contentRow}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <Popover
                    content={
                      <div>
                        <span>物料ID: {item.id}</span>
                      </div>
                    }
                  >
                    <div
                      style={{
                        width: '20px',
                        backgroundColor: '#f1f3f4',
                        textAlign: 'center',
                        marginRight: '5px',
                      }}
                    >
                      ID
                    </div>
                  </Popover>
                  <div className={styles.itemName}>{item.name}</div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div className={innerStyles.col1} ref={wrapperRef} style={{ height: '100px' }}>
                    <MaterialCover data={item} CoverBoxRef={wrapperRef} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'row', marginLeft: '0px' }}>
                    {editId !== item.id && (
                      <EditTwoTone
                        onClick={() => {
                          setEditId(item.id as any);
                          const index = batchTags.findIndex(tag => tag.id == item.id);
                          if (index === -1) {
                            setCurTags(allTags);
                          } else {
                            setCurTags(batchTags[index]?.tagIds as any);
                          }
                        }}
                        style={{ fontSize: '17px' }}
                      />
                    )}
                    {editId === item.id && (
                      <CloseOutlined
                        style={{ color: 'red', fontSize: '17px' }}
                        onClick={() => {
                          setEditId(-1);
                          setCurTags(batchTags[batchTags.findIndex(tag => tag.id == item.id)]?.tagIds as any);
                        }}
                      />
                    )}
                    {editId === item.id && (
                      <CheckOutlined
                        style={{ color: '#349cfc', fontSize: '17px', marginLeft: '20px' }}
                        onClick={() => {
                          if (batchTags.length !== 0) {
                            const newBatchTags = batchTags;
                            const index = newBatchTags.findIndex(i => i.id === item.id);
                            if (index !== -1) {
                              newBatchTags[index].tagIds = curTags;
                            } else {
                              newBatchTags.push({ id: item.id as any, tagIds: curTags, onPlatform: true });
                            }
                            setBatchTags([...newBatchTags]);
                          } else {
                            setBatchTags([{ id: item.id as any, tagIds: curTags, onPlatform: true }]);
                          }
                          setEditId(-1);
                        }}
                      />
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {getTagNames(item.id).map((name: string, index: number) => {
                    return (
                      <Tag color="default" key={index} style={{ margin: '2px' }}>
                        {name}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className={innerStyles.tags}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {getTreeData(tagList).map(item => (
              <Button
                value={item.id}
                key={item.id}
                onClick={() => {
                  setCur(item.value);
                }}
                style={{ margin: '10px', border: 'none', background: 'none' }}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Divider type="vertical" style={{ height: '600px' }} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              overflow: 'auto',
              alignContent: 'flex-start',
            }}
          >
            {tagList
              .filter((item: any) => item.category == cur)
              .map((i: any) => (
                <Checkbox
                  key={i.id}
                  checked={
                    editId === 0
                      ? !allTags.length
                        ? false
                        : (allTags as any)?.includes(i.id)
                      : !curTags.length
                      ? false
                      : (curTags as any)?.includes(i.id)
                  }
                  style={{ width: '110px', margin: '10px 5px' }}
                  onChange={e => {
                    if (e.target.checked) {
                      if (editId === 0) {
                        setAllTags([...allTags, i.id] as any);
                      } else if (editId === -1) {
                        message.warning('请选择需要修改的素材');
                      } else {
                        setCurTags([...curTags, i.id] as any);
                      }
                    } else if (editId === -1) {
                      message.warning('请选择需要修改的素材');
                    } else {
                      if (editId === 0) {
                        setAllTags(allTags.filter(item => item !== i.id));
                      } else {
                        setCurTags(curTags.filter(item => item !== i.id));
                      }
                    }
                  }}
                >
                  {i.name}
                </Checkbox>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
