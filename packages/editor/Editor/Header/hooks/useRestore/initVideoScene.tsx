import { ISceneState } from '@editor/aStore';
import { VideoBoard } from '@editor/type4';
import { Modal } from 'antd';
import { css } from 'emotion';

export default (projectId: number) =>
  new Promise<ISceneState[]>(resolve => {
    const modal = Modal.info({
      centered: true,
      maskClosable: false,
      icon: null,
      width: 1334,
      className: css({
        maxWidth: 'unset',
        '& .ant-modal-confirm-btns': {
          display: 'none',
        },

        '& .ant-modal-confirm-content': {
          width: '100%',
        },
      }),
      content: (
        <VideoBoard
          projectId={projectId}
          onFinish={scenes => {
            resolve(scenes);
            modal.destroy();
          }}
        />
      ),
    });
  });
