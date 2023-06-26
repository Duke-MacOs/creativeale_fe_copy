import { Typography } from 'antd';
import type { GetProjectColumn } from '.';

export const editorColumn: GetProjectColumn = ({ onQueryProject }) => ({
  title: '协作者',
  dataIndex: 'editor',
  width: '10%',
  ellipsis: true,
  key: 'editor',
  render(_, { editor, editorName }) {
    return (
      <Typography.Link
        onClick={() => {
          onQueryProject({ editor });
        }}
      >
        {editorName || editor}
      </Typography.Link>
    );
  },
});
