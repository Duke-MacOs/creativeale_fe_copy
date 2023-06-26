import React, { useState, useRef, useContext } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { css } from 'emotion';
import { IUserMaterial } from '@/types/library';
import MaterialCover from '@shared/components/MaterialCover';
import { UserMaterialContext } from '../context';
import { useBatchLibraryAction } from '../Library/useLibrary';
import styles from '../style';

const innerStyles = {
  header: css({
    display: 'flex',
    backgroundColor: '#f8f9fa',
    lineHeight: '50px',
  }),
  col1: css({
    paddingLeft: '50px',
    flex: '0 0 150px',
  }),
  col2: css({
    paddingLeft: '96px',
    flex: 1,
  }),
  content: css({
    maxHeight: '350px',
    overflowY: 'auto',
  }),
  contentRow: css({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e4e9ed',
    '&:last-child': {
      borderBottom: 0,
    },
  }),
  poster: css({
    width: '100px',
    height: '100px',
    borderRadius: '4px',
    backgroundColor: '#f2f2f2',
    objectFit: 'contain',
  }),
  input: css({
    width: '260px',
  }),
};

export interface RenameModalProps {
  items: IUserMaterial[];
  onCancel(): void;
}

export default function RenameModal({ items, onCancel }: RenameModalProps) {
  const { onBatchUpdate } = useBatchLibraryAction();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const {
    library: { refreshList: refreshLibrary },
  } = useContext(UserMaterialContext);
  const [nameDict, setNameDict] = useState(() => {
    return items.reduce((dict, item) => {
      dict[item.id] = item.name;
      return dict;
    }, {} as Record<string | number, string>);
  });
  const [saving, setSaving] = useState(false);
  const handleCancel = usePersistCallback(() => {
    onCancel();
  });
  const handleConfirm = usePersistCallback(() => {
    const names = Object.entries(nameDict).map(([id, name]) => ({ id, name }));
    setSaving(true);
    onBatchUpdate(names).then(() => {
      message.success(`已成功为${names.length}个物料重命名`);
      setSaving(false);
      refreshLibrary();
      onCancel();
    });
  });

  return (
    <Modal
      title="批量重命名"
      width={600}
      open={true}
      footer={
        <div className={styles.modalFooter}>
          <div className={styles.modalFooterTips}>您将修改{items.length}个资源的名称</div>
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
        <div className={innerStyles.col1}>物料样式</div>
        <div className={innerStyles.col2}>物料名称</div>
      </div>
      <div className={innerStyles.content}>
        {items.map(item => {
          return (
            <div key={item.id} className={innerStyles.contentRow}>
              <div className={innerStyles.col1} ref={wrapperRef} style={{ height: '100px' }}>
                <MaterialCover data={item} CoverBoxRef={wrapperRef} />
              </div>
              <div className={innerStyles.col2}>
                <Input
                  className={innerStyles.input}
                  value={nameDict[item.id]}
                  maxLength={15}
                  onChange={e => {
                    setNameDict(dict => ({
                      ...dict,
                      [item.id]: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
