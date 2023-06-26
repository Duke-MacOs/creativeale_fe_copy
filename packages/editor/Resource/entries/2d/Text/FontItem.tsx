import React from 'react';
import { Modal, Button } from 'antd';
import { Delete } from '@icon-park/react';
import { Provider } from '@editor/aStore';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import useDraggable from '../../../common/useDraggable';
import { IMaterial } from '@/types/library';
import Icon from '@ant-design/icons';
import { css } from 'emotion';

export default ({
  item: { id, cover, userId, name, previewUrl },
  provider,
  staffId,
}: {
  item: IMaterial;
  provider: Provider;
  staffId?: string | number;
}) => {
  const onDelResourceEntry = useDelResourceEntry();
  const dragProps = useDraggable({
    mime: 'Text',
    url: '艺术字体',
    name: '艺术字体',
    props: { fontSize: 30, color: '#333333', font: previewUrl },
  });

  return (
    <div
      className={css({
        position: 'relative',
        borderRadius: 4,
        cursor: 'pointer',
        ':hover>div': { display: 'flex !important' },
      })}
      {...dragProps}
    >
      <img
        style={{
          width: '100%',
          padding:
            provider === 'project' || (provider === 'shared' && staffId === userId) ? '4px 32px 4px 16px' : '4px 16px',
          height: 76,
          objectFit: 'contain',
        }}
        src={cover}
        alt="Font Cover"
      />
      <div
        style={{
          height: '100%',
          width: '100%',
          background: 'rgba(0, 0, 0, 0.1)',
          position: 'absolute',
          transition: '200ms',
          top: 0,
          left: 0,
          borderRadius: 4,
          display: 'none',
          justifyContent: 'end',
          alignItems: 'center',
        }}
      >
        {(provider === 'project' || (provider === 'shared' && staffId === userId)) && (
          <Button
            type="text"
            onClick={event => {
              event.stopPropagation();
              Modal.confirm({
                title: `确定删除${name}吗？`,
                okText: '确定',
                cancelText: '取消',
                onOk() {
                  onDelResourceEntry('Font', provider, id);
                },
              });
            }}
            icon={<Icon component={Delete as any} />}
          />
        )}
      </div>
    </div>
  );
};
