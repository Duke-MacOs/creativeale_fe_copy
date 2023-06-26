import { Alert, Button, Input, message, Modal } from 'antd';

export const HandoverModal = ({ data, onClose }: { data: string; onClose: () => void }) => {
  const copyText = (text = '') => {
    navigator.clipboard.writeText(text).then(
      () => message.success('成功复制链接'),
      () => message.error('链接复制失败')
    );
    onClose();
  };
  return (
    <Modal title="获取移交链接" onCancel={onClose} visible={true} centered footer={null}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Input.TextArea
          value={data}
          readOnly
          autoSize
          style={{
            width: '85%',
            border: '1px solid #e0e0e0',
            outline: 'none',
            resize: 'none',
          }}
        />
        <Button
          size="middle"
          type="primary"
          onClick={() => {
            copyText(data);
            close();
          }}
        >
          复制
        </Button>
      </div>
      <Alert
        message="提示"
        description="本链接有效期为1天"
        type="info"
        showIcon
        style={{ marginTop: '20px', paddingLeft: '20px' }}
      />
    </Modal>
  );
};
