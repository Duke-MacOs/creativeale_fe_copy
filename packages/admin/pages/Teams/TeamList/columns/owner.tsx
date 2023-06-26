import { Typography } from 'antd';
import { GetTeamColumn } from '.';

export const ownerColumn: GetTeamColumn = ({ onParamsChange }) => ({
  title: '创建者',
  dataIndex: 'owner',
  width: '10%',
  key: 'owner',
  render(_, { owner, ownerName }) {
    return (
      <Typography.Link
        onClick={() => {
          onParamsChange({ userId: owner });
        }}
      >
        {ownerName}
      </Typography.Link>
    );
  },
});
