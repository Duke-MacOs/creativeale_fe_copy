import { useEffect, useState } from 'react';
import { Checkbox, Form, message, Modal, Tooltip } from 'antd';
import { oneService } from '@shared/api/oneServiceAPI';

export const CancelAuthorizeModal = ({ playable_url, onClose }: { playable_url: string; onClose: () => void }) => {
  const [authTeams, setAuthTeams] = useState<
    { id: number; playable_url: string; auth_team_id: string; authTeamName: string }[]
  >([]);
  const [form] = Form.useForm();

  const getAuthTeams = async () => {
    const { data } = await oneService.fetchAuthorizeTeams({ playable_url });
    setAuthTeams(data);
  };
  const cancelAuthorize = async (ids: number[]) => {
    if (ids) {
      try {
        const data = await oneService.cancelAuthorize({ ids });
        if (data.message === 'success') {
          message.success('取消授权成功');
        } else {
          message.error('取消授权失败');
        }
      } catch (err) {
        message.error(err);
      } finally {
        onClose();
      }
    } else {
      onClose();
    }
  };
  useEffect(() => {
    getAuthTeams();
  }, []);
  return (
    <Modal
      title="取消看数授权"
      visible={true}
      centered
      onCancel={onClose}
      onOk={async () => {
        const { features } = await form.validateFields();
        await cancelAuthorize(features);
      }}
    >
      {authTeams?.length ? (
        <Form form={form} preserve={false}>
          <Form.Item name="features">
            <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', height: '350px', overflow: 'scroll' }}>
              {authTeams.map(item => (
                <Checkbox key={item.id} value={item.id} style={{ display: 'flex', margin: '5px' }}>
                  <Tooltip title={item.auth_team_id}>{item.authTeamName}</Tooltip>
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Form>
      ) : (
        <div>该素材暂未授予任何团队看数权限</div>
      )}
    </Modal>
  );
};
