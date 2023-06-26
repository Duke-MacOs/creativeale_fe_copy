import { useEffect } from 'react';
import { HamburgerButton } from '@icon-park/react';
import { StopOutlined } from '@ant-design/icons';
import { Log, resizeStyle } from './index';
import useDragY from './hooks/useDragY';
import { Button } from 'antd';
import { css } from 'emotion';

const fontColor = {
  default: 'black',
  log: '#9b9b28',
  error: 'red',
};

const record = {
  height: 150,
};

const LogBoard = ({ logs, visible, onClean }: { logs: Log[]; visible: boolean; onClean: () => void }) => {
  const { mainRef: logRef, footerRef } = useDragY({ minHeight: 150, maxHeightEqualHeight: true, record });

  useEffect(() => {
    const isOnBottom = () => {
      if (logRef.current) {
        return logRef.current.scrollHeight <= logRef.current.clientHeight + logRef.current.scrollTop + 50;
      }
      return false;
    };
    if (logRef.current && isOnBottom()) {
      const scrollHeight = logRef.current.scrollHeight;
      logRef.current.scrollTo(0, scrollHeight);
    }
  }, [logs]);

  return (
    <div
      ref={logRef}
      className={css({
        minWidth: 330,
        height: record.height,
        display: visible ? 'block' : 'none',
        overflow: 'auto',
        zIndex: 99,
        '::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      <Button
        type="text"
        style={{ marginRight: 10, position: 'absolute', right: '2px', top: '0px', zIndex: 99 }}
        onClick={onClean}
        icon={<StopOutlined size={12} />}
      />
      {logs.map((log, idx) => {
        return (
          <div
            key={idx}
            className={css({
              color: fontColor[log.level] || 'black',
              padding: '5px 10px',
              overflowWrap: 'anywhere',
            })}
          >
            {log.message}
          </div>
        );
      })}
      <div className={resizeStyle} ref={footerRef}>
        <HamburgerButton theme="outline" size="10" fill="#333" />
      </div>
    </div>
  );
};

export default LogBoard;
