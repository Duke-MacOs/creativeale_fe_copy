import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Drawer, Button, Spin, Input, message, Divider } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { CloseCircleFilled, EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { css } from 'emotion';
import { isNil, isNumber } from 'lodash';
import { Categories } from '@shared/config';
import { IUserMaterial } from '@/types/library';
import { getMaterialById, updateTagOfMaterial } from '@shared/api/library';
import MaterialPreview from '@shared/components/MaterialPreview';
import { useBatchLibraryAction } from '../Library/useLibrary';
import { MaterialContext } from '../context';
import styles from '../style';
import { fetchAllMaterialTag } from '@shared/api/library';
import getTreeData from './convertData';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import TextArea from 'antd/lib/input/TextArea';
const innerStyles = {
  drawer: css({
    '& .ant-image-mask': {
      opacity: 0,
      cursor: 'zoom-in',
    },
  }),
  content: css({
    display: 'flex',
    height: '100%',
  }),
  contentLeft: css({
    flex: '0 0 250px',
    width: '250px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '-8px',
    marginLeft: '-8px',
    minHeight: '444px',
    backgroundColor: '#F2F4F7',
  }),
  contentRight: css({
    flex: 1,
    padding: '0 24px',
    width: 0,
    height: '100%',
  }),
  contentRow: css({
    padding: '12px 0',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    '&:first-child': {
      paddingTop: 0,
    },
  }),
  contentCol1: css({
    flex: '0 0 60px',
    textAlign: 'right',
    color: '#999',
  }),
  contentCol2: css({
    flex: '0 0 1',
    paddingLeft: '20px',
    overflow: 'hidden',
  }),
  loadingWrapper: css({
    paddingTop: '200px',
    height: '500px',
    textAlign: 'center',
  }),
  nameButton: css({
    marginLeft: '8px',
    padding: '4px 8px',
  }),
  select: css({
    width: '300px',
    maxHeight: '30px',
    height: '30px',
    color: '#999',
    marginLeft: '10px',
    marginTop: '0',
    resize: 'none',
  }),
};

interface Props {
  id: IUserMaterial['id'] | null;
  visible: boolean;
  onCancel(): void;
  onRefetch: (resetPage?: boolean) => void;
}

export default function DetailModal({ id, visible, onCancel, onRefetch }: Props) {
  const {
    library: { refreshList: refreshLibrary },
  } = useContext(MaterialContext);
  const [detail, setDetail] = useState<IUserMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tagList, setTagList] = useState([]);
  const [defaultTags, setDefaultTags] = useState([]);
  const [defaultTagNames, setDefaultTagNames] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagNames, setTagNames] = useState([]);
  const [changeTags, setChangeTags] = useState(false);
  const [cur, setCur] = useState('1');

  const { onBatchUpdate } = useBatchLibraryAction();
  const nameMaxLength = 50;
  const fileSize = useMemo(() => {
    const size = detail?.extra?.size;
    let calcSize = 0;
    let unit = 'KB';

    if (isNumber(size)) {
      calcSize = size / 1024;
      if (calcSize > 1024) {
        calcSize = calcSize / 1024;
        unit = 'MB';
      }
    }
    return calcSize.toFixed(2) + unit;
  }, [detail]);

  const fetchDetail = usePersistCallback((isRandom?: boolean) => {
    if (!isNil(id)) {
      setLoading(true);
      getMaterialById(id, isRandom).then(detail => {
        setDetail(detail);
        const defaultTags = detail?.tags?.filter(item => item.origin !== 1).map(item => item.id) ?? [];
        const defaultTagNames = detail?.tags?.filter(item => item.origin !== 1).map(item => item.name) ?? [];
        setDefaultTags(defaultTags as any);
        setDefaultTagNames(defaultTagNames as any);
        setTags(defaultTags as any);
        setTagNames(defaultTagNames as any);
        setLoading(false);
        setTempName(detail.name);
      });
    }
  });
  const handleInputChange = usePersistCallback(e => {
    const val = e.currentTarget.value;
    if (val.length <= nameMaxLength) {
      setTempName(val);
    }
  });
  const handleConfirmUpdate = usePersistCallback(() => {
    if (!id) return;
    const trimmedName = tempName.trim();
    if (!trimmedName) {
      message.error('资源名称不能为空');
      return;
    }

    setSaving(true);
    onBatchUpdate([{ id, name: tempName }]).then(() => {
      fetchDetail(true);
      onRefetch();
      setShouldRefresh(true);
      setSaving(false);
      setEditing(false);
    });
  });
  const handleCancel = usePersistCallback(() => {
    onCancel();
    setChangeTags(false);
    setCur('1');
  });

  const handleUpdateTags = () => {
    const categoryTag = detail?.tags?.filter(item => item.origin === 1).map(item => item.id) ?? [];
    const platFormTags: any = categoryTag?.concat(tags);
    updateTagOfMaterial([id + ''], platFormTags, [])
      .then(data =>
        data.message === 'success'
          ? message.success('修改成功', 0.5).then(() => fetchDetail())
          : message.success(`${data.message}`, 0.5).then(() => fetchDetail())
      )
      .then(() => onRefetch());

    setChangeTags(false);
    setCur('1');
  };
  useEffect(() => {
    if (visible) {
      fetchDetail();
    }
  }, [visible, fetchDetail]);
  useEffect(() => {
    if (!visible && shouldRefresh) {
      setShouldRefresh(false);
      refreshLibrary();
    }
  }, [visible, shouldRefresh, refreshLibrary]);
  useEffect(() => {
    fetchAllMaterialTag({ onPlatform: true }).then(data => {
      setTagList(data.tags);
    });
  }, []);
  return (
    <Drawer
      title="资源详情"
      placement="right"
      width={896}
      open={visible}
      rootClassName={innerStyles.drawer}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleCancel}>关闭</Button>
        </div>
      }
      onClose={handleCancel}
    >
      <Spin size="large" spinning={loading}>
        <div
          className={innerStyles.content}
          onClick={() => {
            setChangeTags(false);
            setCur('1');
          }}
        >
          <div
            className={innerStyles.contentLeft}
            style={{ cursor: detail?.type.cid === Categories.image ? 'zoom-in' : 'default', height: '470px' }}
          >
            {detail && visible && (
              <div style={{ zoom: 0.66 }}>
                <MaterialPreview detail={detail} />
              </div>
            )}
          </div>
          <div className={innerStyles.contentRight}>
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>资源名称</div>
              {editing ? (
                <div className={innerStyles.contentCol2}>
                  <Input
                    style={{ width: '300px' }}
                    value={tempName}
                    maxLength={nameMaxLength}
                    suffix={
                      saving ? (
                        <LoadingOutlined />
                      ) : (
                        <span className={styles.stringLength}>
                          {tempName.length}/{nameMaxLength}
                        </span>
                      )
                    }
                    onChange={handleInputChange}
                  />

                  <Button
                    className={innerStyles.nameButton}
                    type="primary"
                    loading={saving}
                    onClick={handleConfirmUpdate}
                  >
                    确认
                  </Button>
                  <Button className={innerStyles.nameButton} type="default" onClick={() => setEditing(false)}>
                    取消
                  </Button>
                </div>
              ) : (
                <>
                  <div className={innerStyles.contentCol2}>{detail?.name}</div>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setEditing(true)} />
                </>
              )}
            </div>
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>资源ID</div>
              <div className={innerStyles.contentCol2}>{detail?.id}</div>
            </div>
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>文件大小</div>
              <div className={innerStyles.contentCol2}>{fileSize}</div>
            </div>
            {detail?.extra?.width && detail?.extra?.height && (
              <div className={innerStyles.contentRow}>
                <div className={innerStyles.contentCol1}>像素尺寸</div>
                <div className={innerStyles.contentCol2}>{`${detail?.extra?.width}*${detail?.extra.height}`}</div>
              </div>
            )}
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>格式</div>
              <div className={innerStyles.contentCol2}>{detail?.extra?.ext}</div>
            </div>
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>上传者</div>
              <div className={innerStyles.contentCol2}>{detail?.extra?.userName}</div>
            </div>
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>创建时间</div>
              <div className={innerStyles.contentCol2}>{detail?.createdAt}</div>
            </div>
            {detail?.description && (
              <div className={innerStyles.contentRow}>
                <div className={innerStyles.contentCol1}>素材描述</div>
                <div className={innerStyles.contentCol2}>{detail?.description}</div>
              </div>
            )}
            {detail?.tags && (
              <div className={innerStyles.contentRow}>
                <div className={innerStyles.contentCol1}>类别标签</div>
                <div className={innerStyles.contentCol2}>{detail?.tags?.find(tag => tag.origin === 1)?.name}</div>
              </div>
            )}
            <div className={innerStyles.contentRow}>
              <div className={innerStyles.contentCol1}>平台标签</div>
              <TextArea
                placeholder="请选择平台标签"
                value={tagNames}
                readOnly
                className={innerStyles.select}
                onClick={e => {
                  e.stopPropagation();
                  setChangeTags(!changeTags);
                  if (cur !== '1') {
                    setCur('1');
                  }
                }}
              />
              {changeTags && (
                <CloseCircleFilled
                  style={{ position: 'absolute', right: '200px', opacity: '0.4' }}
                  onClick={e => {
                    e.stopPropagation();
                    setTags([]);
                    setTagNames([]);
                  }}
                />
              )}
              {changeTags && (
                <>
                  <Button className={innerStyles.nameButton} type="primary" onClick={() => handleUpdateTags()}>
                    确认
                  </Button>
                  <Button
                    className={innerStyles.nameButton}
                    type="default"
                    onClick={() => {
                      setTags(defaultTags);
                      setTagNames(defaultTagNames);
                      setChangeTags(false);
                      setCur('1');
                    }}
                  >
                    取消
                  </Button>
                </>
              )}
            </div>
            {changeTags && (
              <div
                style={{
                  width: '500px',
                  height: '300px',
                  display: 'flex',
                  border: '1px solid #e8e8e8',
                  marginLeft: '70px',
                  marginTop: '-10px',
                }}
                onClick={e => e.stopPropagation()}
              >
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
                <Divider type="vertical" style={{ height: '300px' }} />
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
                        checked={!tags.length ? false : (tags as any)?.includes(i.id)}
                        style={{ width: '110px', margin: '10px 5px' }}
                        onChange={e => {
                          if (e.target.checked) {
                            setTags([...tags, i.id] as any);
                            setTagNames([...tagNames, i.name] as any);
                          } else {
                            setTags(tags.filter(item => item !== i.id));
                            setTagNames(tagNames.filter(item => item !== i.name));
                          }
                        }}
                      >
                        {i.name}
                      </Checkbox>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </Drawer>
  );
}
