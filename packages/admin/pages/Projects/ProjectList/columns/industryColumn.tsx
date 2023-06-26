import { Tag } from 'antd';
import { css } from 'emotion';
import type { GetProjectColumn } from '.';
import { INDUSTRY_OPTIONS } from './ProjectModal';

export const industryColumn: GetProjectColumn = ({ onQueryProject }) => ({
  title: '行业',
  dataIndex: 'industry',
  width: '15%',
  key: 'industry',
  className: css({ lineHeight: '28px' }),
  render(_, { industry }) {
    return (
      <>
        {INDUSTRY_OPTIONS.filter(({ value }) => Number(industry) & (1 << value)).map(({ label, value }) => (
          <Tag
            key={value}
            color="processing"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onQueryProject({ industry: String(1 << value) });
            }}
          >
            {label}
          </Tag>
        ))}
      </>
    );
  },
});
