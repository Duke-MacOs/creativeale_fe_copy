import { Typography } from 'antd';
import type { GetProjectColumn } from '.';

export const versionGroup: GetProjectColumn = ({ onQueryProject }) => {
  return {
    title: '版本组',
    dataIndex: 'parentId',
    width: '10%',
    ellipsis: true,
    key: 'parentId',
    render(_, { parentId }) {
      return (
        <Typography.Link
          onClick={() => {
            onQueryProject({ parentId: String(parentId) });
          }}
        >
          {parentId}
        </Typography.Link>
      );
    },
  };
};
