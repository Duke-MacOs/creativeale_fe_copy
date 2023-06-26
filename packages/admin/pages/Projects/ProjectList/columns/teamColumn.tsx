import { Typography } from 'antd';
import type { GetProjectColumn } from '.';

export const teamColumn: GetProjectColumn = ({ onQueryProject }) => ({
  title: '归属团队',
  dataIndex: 'teamId',
  width: '10%',
  ellipsis: true,
  key: 'teamId',
  render(_, { teamId, teamName }) {
    return (
      <Typography.Link
        onClick={() => {
          onQueryProject({ teamId });
        }}
      >
        {teamName || teamId}
      </Typography.Link>
    );
  },
});
