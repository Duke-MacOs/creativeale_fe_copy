import { Typography } from 'antd';
import { GetTeamColumn } from '.';
import { TeamType } from '../TeamTable';

export const typeColumn: GetTeamColumn = ({ onParamsChange }) => ({
  title: '类型',
  dataIndex: 'type',
  key: 'type',
  width: '10%',
  align: 'center',
  ellipsis: true,
  render: (type: number) => (
    <Typography.Link
      onClick={() => {
        onParamsChange({ type: String(type) });
      }}
    >
      {TeamType[type]}
    </Typography.Link>
  ),
});
