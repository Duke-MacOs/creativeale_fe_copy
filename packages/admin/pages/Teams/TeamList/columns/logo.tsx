import { Avatar } from 'antd';
import { GetTeamColumn } from '.';

export const logoColumn: GetTeamColumn = ({}) => ({
  title: '团队图标',
  dataIndex: 'logo',
  key: 'logo',
  width: '10%',
  align: 'center',
  render: (logo: string) => <Avatar size="large" src={logo} />,
});
