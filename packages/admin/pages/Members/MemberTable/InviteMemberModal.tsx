import { Modal, message, Typography } from 'antd';
import { copyText } from '@shared/utils';
import { http } from '@shared/api';
import { collectEventTableAction } from '@main/collectEvent';
import { useUserInfo } from '@shared/userInfo';
import { INVITE_MEMBER_KEY } from '@main/views/Header/useJoinTeam';

interface EditMemberProps {
  onCancel: () => void;
}

const collect = collectEventTableAction('新增团队成员');

export default ({ onCancel }: EditMemberProps) => {
  const {
    userInfo: { teams, teamId },
  } = useUserInfo();
  return (
    <Modal
      open
      centered
      destroyOnClose
      okText="复制链接"
      title="新增团队成员"
      onOk={async () => {
        try {
          const {
            data: { data },
          } = await http.post('/team/inviteMember', { maxAge: 10 * 60, maxCount: 10 });
          copyText(
            `请打开链接加入“${teams.find(({ id }) => id === teamId)?.name}”团队，链接10分钟内有效：${
              location.origin
            }/pub/template?${INVITE_MEMBER_KEY}=${data}`
          );
          message.success('加入链接已复制');
          collect('okay');
          onCancel();
        } catch (error) {
          message.error(error.message);
          collect('error');
          onCancel();
        }
      }}
      onCancel={() => {
        collect('cancel');
        onCancel();
      }}
    >
      <Typography>请管理员复制“加入链接”分享给其他成员，其他成员打开链接即可加入团队，链接10分钟内有效。</Typography>
    </Modal>
  );
};
