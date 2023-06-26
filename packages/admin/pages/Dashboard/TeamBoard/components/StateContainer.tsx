import { Button, Result, Spin } from 'antd';
import React from 'react';

import useRequestState from '../hooks/useRequestState';

const Error = ({ resend }: { resend: () => void }) => (
  <Result
    status="error"
    title="请求失败"
    extra={[
      <Button type="primary" key="console" onClick={resend}>
        重试
      </Button>,
    ]}
  />
);

export default <P extends object>(
  WrapComponent: React.ComponentType<P>,
  key: string,
  style?: React.CSSProperties
): React.FC<P> => {
  return props => {
    const requestState = useRequestState('listen', key);
    const resend = useRequestState('resend', key);
    return requestState.loading || requestState.error ? (
      <div style={{ ...style, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {requestState.loading && <Spin />}
        {requestState.error && <Error resend={resend} />}
      </div>
    ) : (
      <WrapComponent {...(props as P)} />
    );
  };
};
