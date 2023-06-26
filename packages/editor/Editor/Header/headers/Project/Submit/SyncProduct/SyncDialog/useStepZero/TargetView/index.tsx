import { classnest } from '@editor/utils';
import { css } from 'emotion';
import React from 'react';
import downloadApp from './download_app.png';
import storeMarketing from './store_marketing.png';

export interface TargetViewProps {
  title: string;
  content: string;
  icon: string;
  selected: boolean;
  onClick(): void;
}

export default ({ value, onChange }: { value?: number; onChange?: (value: number) => void }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Target
        title="APP应用"
        content="推广您的线上APP"
        selected={value === 1}
        icon={downloadApp}
        onClick={() => {
          onChange?.(1);
        }}
      />
      <Target
        title="电商店铺引流"
        content="提升线上店铺的推广效果"
        selected={value === 2}
        icon={storeMarketing}
        onClick={() => {
          onChange?.(2);
        }}
      />
    </div>
  );
};

export const Target = ({ title, content, icon, selected, onClick }: TargetViewProps) => {
  const className = css({
    display: 'flex',
    alignItems: 'center',
    borderRadius: 4,
    border: '1px solid #EEEEEE',
    cursor: 'pointer',
    padding: 16,
    width: 208,
    height: 102,
    '&+&': {
      marginLeft: 16,
    },
    '&-selected': {
      borderColor: '#3955F6',
      '.ant-form-item-has-error &': {
        borderColor: '#f65656',
      },
    },
  });
  return (
    <div onClick={onClick} className={classnest({ [className]: { selected } })}>
      <div style={{ flex: 'auto' }}>
        <h3>{title}</h3>
        <div style={{ color: '#999999' }}>{content}</div>
      </div>
      <img src={icon} />
    </div>
  );
};
