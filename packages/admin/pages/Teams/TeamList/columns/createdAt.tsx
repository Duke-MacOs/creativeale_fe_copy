import { GetTeamColumn } from '.';

export const createAtColumn: GetTeamColumn = ({}) => ({
  title: '创建时间',
  dataIndex: 'createdAt',
  key: 'createdAt',
  width: '15%',
  ellipsis: true,
  render: (createdAt: string) => (
    <div style={{ padding: '6px', background: 'none', userSelect: 'text' }}>{createdAt}</div>
  ),
});
