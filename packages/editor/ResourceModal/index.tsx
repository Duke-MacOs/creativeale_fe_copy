import { Modal } from 'antd';
import { useState } from 'react';
import { css } from 'emotion';
import Container from './Container';

interface IController {
  showModal: () => void;
  hideModal: () => void;
}

export const resourceModalController: IController = (() => {
  return {
    showModal: () => {
      throw new Error('Empty function');
    },
    hideModal: () => {
      throw new Error('Empty function');
    },
  };
})();

export default () => {
  const [visibleModal, setVisibleModal] = useState(false);

  const showModal = () => {
    setVisibleModal(true);
  };

  const hideModal = () => {
    setVisibleModal(false);
  };

  resourceModalController.showModal = showModal;
  resourceModalController.hideModal = hideModal;

  console.log('Modal:', visibleModal);

  return (
    <Modal
      style={{ padding: '12px 0' }}
      className={css({
        '.ant-modal-content': {
          padding: '0',
        },
        '.ant-modal-body': {
          padding: '12px 0 0 0',
        },
      })}
      // mask={false}
      title={null}
      visible={visibleModal}
      onCancel={hideModal}
      width={1200}
      footer={false}
      destroyOnClose
    >
      <Container visibleModal={visibleModal} />
    </Modal>
  );
};
