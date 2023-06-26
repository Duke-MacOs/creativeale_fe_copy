import { Modal } from 'antd';
import { css } from 'emotion';
import ProcessModal from './ProcessModal';
interface ModalProps {
  processList: File[];
}
export default function process({ processList }: ModalProps) {
  return new Promise(resolve => {
    Modal.confirm({
      centered: true,
      maskClosable: false,
      icon: null,
      visible: true,
      width: '1100px',
      className: css({
        '& .ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content': {
          marginLeft: 0,
        },
        '& .ant-modal-confirm-btns': {
          display: 'none',
        },
      }),
      bodyStyle: { padding: '10px 20px 20px 10px' },
      content: <ProcessModal list={processList} onFinish={files => resolve(files)} />,
    });
  });
}
