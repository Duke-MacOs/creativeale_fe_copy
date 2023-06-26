import { Modal, Button } from 'antd';
import { useState } from 'react';
import Table from './Table';
import { useLayer } from './hooks';
import { shallowEqual, useSelector } from 'react-redux';
import { css } from 'emotion';

interface IController {
  showModal: () => void;
  hideModal: () => void;
}

const MAX_COLLISIONS_LENGTH = 31;

export const layerModalController: IController = (() => {
  return {
    showModal: () => {
      throw new Error('Empty function');
    },
    hideModal: () => {
      throw new Error('Empty function');
    },
  };
})();

export const LayerModal = function () {
  const { addCollision } = useLayer();
  const [visibleModal, setVisibleModal] = useState(false);
  const { enabled3d, layerCollisionName } = useSelector(
    ({
      project: {
        settings: { enabled3d, layerCollisionName = [] },
      },
    }: EditorState) => {
      return { enabled3d, layerCollisionName };
    },
    shallowEqual
  );

  const showModal = () => {
    setVisibleModal(true);
  };

  const hideModal = () => {
    setVisibleModal(false);
  };

  layerModalController.showModal = showModal;
  layerModalController.hideModal = hideModal;

  return enabled3d ? (
    <Modal
      style={{ padding: '12px 24px' }}
      className={css({
        '.ant-modal-body': {
          padding: '12px 24px',
        },
      })}
      title="碰撞组设置"
      open={visibleModal}
      onCancel={hideModal}
      width={650}
      footer={false}
      destroyOnClose
    >
      {layerCollisionName.length < MAX_COLLISIONS_LENGTH && (
        <Button style={{ marginBottom: '12px' }} onClick={addCollision}>
          新增碰撞组
        </Button>
      )}
      <Table />
    </Modal>
  ) : null;
};
