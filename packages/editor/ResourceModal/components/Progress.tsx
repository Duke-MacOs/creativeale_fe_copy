import { Button, Modal, Progress, Result, Spin, Typography } from 'antd';
import { css } from 'emotion';
import { useImportState } from '../Context';
import { ImportStatus } from '../type';

export default props => {
  const { state, updateImportState, resetState } = useImportState();

  const onClose = () => {
    resetState();
  };

  const result = (
    <Result
      status="warning"
      title={
        <div style={{ width: '600px', maxHeight: '200px', overflowY: 'scroll', overflowX: 'scroll' }}>
          {state.error.map((i: string) => (
            <p style={{ fontSize: '14px' }}>
              <Typography.Text type="warning">{i}</Typography.Text>
            </p>
          ))}
        </div>
      }
      extra={
        <Button type="primary" key="console" onClick={onClose}>
          关闭
        </Button>
      }
    />
  );

  const progress = (
    <>
      <Spin />
      <Progress style={{ width: '80%' }} percent={Math.floor((state.finish / state.total) * 100)} status="active" />
      <p>
        {state.desc}:{state.finish}/{state.total}
      </p>
    </>
  );

  return (
    <Modal
      title={null}
      className={css({
        '.ant-modal-body': {
          padding: '0',
        },
      })}
      width="auto"
      zIndex={2000}
      getContainer={false}
      closable={false}
      destroyOnClose={true}
      visible={state.status !== ImportStatus.rest}
      // visible={true}
      footer={null}
      centered={true}
      onCancel={onClose}
    >
      <div
        style={{
          width: '800px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {state.status === ImportStatus.handing && progress}
        {state.status === ImportStatus.finish && result}
      </div>
    </Modal>
  );
  // return (
  //   <Spin tip={<Progress style={{ width: '50%' }} percent={60} status="active" />} indicator={undefined}>
  //     {props.children}
  //   </Spin>
  // );
};
