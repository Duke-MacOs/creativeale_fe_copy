import { classnest } from '@editor/utils';
import { theme } from 'antd';
import { css } from 'emotion';
import downloadApp from './download_app.png';
import storeMarketing from './store_marketing.png';

export interface TargetViewProps {
  title: string;
  content: string;
  icon: string;
  selected: boolean;
  onClick(): void;
}

export const TargetView = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Target
        title="中国区"
        content="用于投放中国区"
        selected={value === 'mainland'}
        icon={downloadApp}
        onClick={() => {
          onChange?.('mainland');
        }}
      />
      <Target
        title="非中国区"
        content="用于投放非中国区"
        selected={value === 'overseas'}
        icon={storeMarketing}
        onClick={() => {
          onChange?.('overseas');
        }}
      />
    </div>
  );
};

export const SaveAstView = ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Target
        title="普通互动"
        content="用于落地页"
        selected={value === 'landingPage'}
        icon={downloadApp}
        onClick={() => {
          onChange?.('landingPage');
        }}
      />
      <Target
        title="直出互动"
        content="用于信息流"
        selected={value === 'feedContent'}
        icon={storeMarketing}
        onClick={() => {
          onChange?.('feedContent');
        }}
      />
    </div>
  );
};

export const Target = ({ title, content, icon, selected, onClick }: TargetViewProps) => {
  const { token } = theme.useToken();
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
        <div className={css({ marginBottom: '0.5em', color: token.colorText, fontWeight: 500 })}>{title}</div>
        <div style={{ color: '#999999' }}>{content}</div>
      </div>
      <img src={icon} />
    </div>
  );
};
