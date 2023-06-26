import React, { useState } from 'react';
import { Button, Input, Tooltip } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { css } from 'emotion';
import { useEffectIcon } from '@editor/common/EffectChanger/EffectList';
import withEffectChanger from '@editor/common/EffectChanger';

const EffectChanger = withEffectChanger();

const styles = {
  wrapper: css({
    display: 'flex',
    width: '100%',
    height: '48px',
    border: '1px solid #ebebeb',
    borderRadius: '4px',
  }),
  poster: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 48px',
    height: '100%',
    borderRight: '1px solid #ebebeb',
    background: '#fafafa',
    lineHeight: '11px',
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    cursor: 'pointer',
  }),
  content: css({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  name: css({
    padding: '0 8px',
    fontSize: '14px',
    lineHeight: '20px',

    '> input': {
      flex: 1,
      height: '100%',
      padding: 0,
      border: 'none',
      borderRadius: 0,
      color: '#333',
      lineHeight: '17px',
      boxShadow: 'none!important',
    },

    '> input:hover': {
      boxShadow: 'none!important',
    },
  }),
  ops: css({
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    '& .ant-btn': {
      height: '100%',
    },
    '& .ant-btn:hover': {
      color: '#3955f6',
      backgroundColor: 'transparent',
    },
  }),
};

interface Props {
  name: string;
  effectInfo: [string, string];
  onChange: (name: string, options?: any) => void;
  onReplace: (props: Record<string, any>) => void;
}

export const AnimationPreview: React.FC<Props> = ({ name, effectInfo, onChange, onReplace }) => {
  const [changerVisible, setChangerVisible] = useState(false);
  const icon = useEffectIcon(effectInfo);

  return (
    <>
      <div className={styles.wrapper} style={changerVisible ? { borderColor: '#3955f6' } : {}}>
        <div
          className={styles.poster}
          onClick={() => {
            setChangerVisible(true);
          }}
        >
          <img src={(icon as any).default} />
        </div>
        <div className={styles.content}>
          <div className={styles.name}>
            <Input
              value={name}
              onChange={({ target: { value } }) => {
                onChange(value);
              }}
            />
          </div>
          <div className={styles.ops}>
            <Tooltip title="更换" placement="bottom">
              <Button
                type="text"
                size="large"
                icon={<SwapOutlined />}
                onClick={() => {
                  setChangerVisible(true);
                }}
              />
            </Tooltip>
          </div>
        </div>
      </div>
      {changerVisible && (
        <EffectChanger
          __script={effectInfo}
          title="更换动画"
          onClose={() => setChangerVisible(false)}
          onChange={({ props }) => {
            onReplace(props);
          }}
        />
      )}
    </>
  );
};
