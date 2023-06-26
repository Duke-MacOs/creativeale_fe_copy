import { RolesMap } from '@main/pages/Members/MemberTable';
import { GetTeamColumn } from '.';

export const rolesColumn: GetTeamColumn = ({}) => ({
  title: '我的角色',
  dataIndex: 'roles',
  key: 'roles',
  width: '10%',
  ellipsis: true,
  render: (roles: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px', background: 'none', userSelect: 'text' }}>
      {RolesMap[roles]}
    </div>
  ),
});
