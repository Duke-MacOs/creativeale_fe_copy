import React, { FC, useRef, useCallback, useState } from 'react';
import { Button, Spin } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import { css } from 'emotion';

const style = {
  frame: css({
    border: 'none',
    backgroundColor: '#000',
  }),
  controller: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  }),
};

interface Props {
  name: string;
  url: string;
}

const IFramePreview: FC<Props> = ({ url, name }) => {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refresh = useCallback(() => {
    if (iframeRef.current && url) {
      iframeRef.current.src = url;
    }
  }, [url]);

  return (
    <>
      <Spin spinning={loading} size="large">
        <iframe
          allow="autoplay"
          name={name}
          title={name}
          src={url}
          className={style.frame}
          style={{ width: '375px', height: `667px` }}
          ref={iframeRef}
          onLoad={() => {
            setLoading(false);
          }}
        >
          {url}
        </iframe>
      </Spin>
      <div className={style.controller} onClick={refresh}>
        <Button icon={<RedoOutlined />}>刷新</Button>
      </div>
    </>
  );
};

export default IFramePreview;
