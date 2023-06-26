import type { GetProjectColumn } from '.';

export const updatedAt: GetProjectColumn = () => ({
  title: '更新时间',
  dataIndex: 'updatedAt',
  width: '20%',
  ellipsis: true,
  key: 'updatedAt',
});
