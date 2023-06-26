import { Tooltip, Typography } from 'antd';
import { GetTeamColumn } from '.';

export const nameColumn: GetTeamColumn = ({ onParamsChange }) => ({
  title: '名称及ID',
  dataIndex: 'name',
  key: 'name',
  width: '10%',
  ellipsis: true,
  render: (_, { id, name }) => (
    <Typography.Link
      onClick={() => {
        onParamsChange({ teamId: String(id) });
      }}
    >
      <Tooltip title={`ID: ${id}`}>{name}</Tooltip>
    </Typography.Link>
  ),
});
