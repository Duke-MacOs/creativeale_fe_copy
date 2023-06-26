import PageContainer from '@main/views/PageContainer';
import { IPageParams } from '../../routes/withPath';
import Table from './MemberTable';

export interface IAdminUserParams extends IPageParams {
  keyword: string;
  deleted: string;
  teamId: string;
  userId: string;
  roles: string;
}

export default function Members() {
  return (
    <PageContainer
      filter={{
        spark: 'flex',
        columnGap: 40,
        content: [
          {
            spark: 'label',
            label: '成员姓名',
            width: 88,
            content: {
              spark: 'string',
              index: 'keyword',
              allowClear: true,
            },
          },

          {
            spark: 'label',
            label: '成员ID',
            width: 88,
            content: {
              spark: 'string',
              index: 'userId',
              allowClear: true,
            },
          },
          {
            spark: 'label',
            label: '成员角色',
            width: 88,
            content: {
              spark: 'select',
              index: 'roles',
              options: [
                { label: '全部', value: '' },
                { label: '普通成员', value: '1' },
                { label: '管理员', value: '3' },
              ],
            },
          },
        ],
      }}
      children={<Table />}
    />
  );
}
