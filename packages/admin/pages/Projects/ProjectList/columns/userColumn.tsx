import { Typography } from 'antd';
import type { GetProjectColumn } from '.';

export const userColumn: GetProjectColumn = ({ onQueryProject }) => ({
  title: '编辑者',
  dataIndex: 'editor',
  width: '10%',
  ellipsis: true,
  key: 'userId',
  render(_, { editor, editorName }) {
    return (
      <Typography.Link
        onClick={() => {
          onQueryProject({ userId: editor });
        }}
      >
        {editorName || editor}
      </Typography.Link>
    );
  },
});
