import React, { useEffect, useState, useMemo, useContext } from 'react';
import { Drawer, Button, Spin, Input, message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { css } from 'emotion';
import { isNil, isNumber } from 'lodash';
import { Categories } from '@shared/config';
import { IUserMaterial } from '@/types/library';
import { fetchUserMaterialDetail } from '@shared/api/library';
import MaterialPreview from '@shared/components/MaterialPreview';
import { useBatchLibraryAction } from '../Library/useLibrary';
import { UserMaterialContext } from '../context';
import styles from '../style';

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
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
};

interface Props {
  id: IUserMaterial['id'] | null;
  visible: boolean;
  onCancel(): void;
}

export default function DetailModal({ id, visible, onCancel }: Props) {
  const {
    library: { refreshList: refreshLibrary },
  } = useContext(UserMaterialContext);

  const [detail, setDetail] = useState<IUserMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [tempName, setTempName] = useState('');

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

  const fetchDetail = usePersistCallback(() => {
    if (!isNil(id)) {
      setLoading(true);
      fetchUserMaterialDetail(id).then(detail => {
        setDetail(detail);
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
      fetchDetail();
      setShouldRefresh(true);
      setSaving(false);
      setEditing(false);
    });
  });
  const handleCancel = usePersistCallback(() => {
    onCancel();
  });

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
        <div className={innerStyles.content}>
          <div
            className={innerStyles.contentLeft}
            style={{ cursor: detail?.type.cid === Categories.image ? 'zoom-in' : 'default' }}
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
          </div>
        </div>
      </Spin>
    </Drawer>
  );
}
