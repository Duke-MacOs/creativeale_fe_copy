import { FeaturesMap } from '@shared/userInfo';
import { Tag } from 'antd';
import { css } from 'emotion';
import { GetTeamColumn } from '.';

export const featuresColumn: GetTeamColumn = ({ onParamsChange }) => ({
  title: '实验功能',
  dataIndex: 'features',
  key: 'features',
  width: '20%',
  className: css({ lineHeight: '28px' }),
  render: (features: string) => {
    const items = Object.entries(FeaturesMap).filter(([key]) => features.includes(key));
    return (
      <>
        {items.map(([key, value]) => (
          <Tag
            key={key}
            color="processing"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onParamsChange({ feature: key });
            }}
          >
            {value}
          </Tag>
        ))}
      </>
    );
  },
});
