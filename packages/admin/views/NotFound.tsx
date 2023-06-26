import React, { FC, useCallback } from 'react';
import { Result, Button } from 'antd';

const NotFound: FC = () => {
  const onBackHome = useCallback(() => {
    location.href = '/';
  }, []);
  return (
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={
        <Button type="primary" onClick={onBackHome}>
          回首页
        </Button>
      }
    />
  );
};

export default NotFound;
