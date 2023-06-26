import type { GetProjectColumn } from '.';

export const createdAt: GetProjectColumn = () => ({
  title: '创建时间',
  dataIndex: 'createdAt',
  width: '20%',
  ellipsis: true,
  key: 'createdAt',
});
