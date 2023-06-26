import { Modal } from 'antd';
import FrameScaleModal from './FrameScaleModal';
import style from './style';
interface ModalProps {
  fileList: File[];
}
export default function process({ fileList }: ModalProps) {
  return new Promise(resolve => {
    Modal.confirm({
      centered: true,
      maskClosable: false,
      icon: null,
      visible: true,
      className: style.confirmModal,
      bodyStyle: { padding: '10px 20px 20px 10px' },
      content: <FrameScaleModal fileList={fileList} onFinish={scale => resolve(scale)} />,
    });
  });
}
