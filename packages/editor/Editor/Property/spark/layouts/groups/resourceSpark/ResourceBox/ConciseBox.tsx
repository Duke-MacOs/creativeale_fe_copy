import type { ResourceBoxProps } from '.';
import TypeIcon from '@editor/Elements/TimePane/Header/NodeSpan/NodeIcon';
import { CloseOutlined, SwapOutlined } from '@ant-design/icons';
import baseTypeLabel from './baseTypeLabel';
import { ResourceChanger } from './Actions';
import { Button, Typography } from 'antd';
import { useState } from 'react';
import { css } from 'emotion';

const className = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });

export const ConciseBox = ({ type, label, name, url, required, baseType, deletable, onChange }: ResourceBoxProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Button
        block
        className={css({
          display: 'flex',
          padding: '0 8px',
          borderRadius: 4,
          alignItems: 'center',
          textAlign: 'left',
        })}
        onClick={() => setVisible(!visible)}
        danger={required && !url}
      >
        <Typography.Text type="secondary" style={{ flex: '0 0 80px', overflow: 'hidden' }}>
          <TypeIcon type={type} /> {label || baseTypeLabel(type, baseType)}
        </Typography.Text>
        {url ? (
          <Typography.Text className={className} style={{ flex: 'auto' }}>
            {name}
          </Typography.Text>
        ) : (
          <Typography.Text className={className} style={{ flex: 'auto' }} type="secondary">
            请选择{name}
          </Typography.Text>
        )}
        {url && deletable ? (
          <CloseOutlined
            style={{ flex: 'none', marginTop: 2 }}
            onClick={event => {
              event.stopPropagation();
              onChange({});
            }}
          />
        ) : (
          <SwapOutlined style={{ flex: 'none', marginTop: 2 }} />
        )}
      </Button>
      {visible && (
        <ResourceChanger
          eleType={type as any}
          onChange={({ url, cover, name }) => {
            onChange({ url: url as string, name, cover });
            setVisible(false);
          }}
          onClose={() => {
            setVisible(false);
          }}
        />
      )}
    </div>
  );
};
