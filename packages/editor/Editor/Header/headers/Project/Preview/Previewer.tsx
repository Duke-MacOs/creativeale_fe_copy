import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { Bug, Log, Monitor, ReplayMusic, Rotate, Share } from '@icon-park/react';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { Button, Modal, message, Tooltip, Select, Dropdown, Card } from 'antd';
import { ReactComponent as IconClose } from './icon_close.svg';
import { PreviewerContent } from './PreviewerContent';
import { getResolutions } from './resolutions';
import { useStorage } from '@byted/hooks';
import { css, keyframes } from 'emotion';
import EventTrack from './EventTrack';
import Icon from '@ant-design/icons';
import { Mask } from '@editor/icons';
import { amIHere } from '@shared/utils';
import { useQRCode } from './useQRCode';
const styles_select = css({
  flex: 1,
});
const styles_closeBtn = css({
  cursor: 'pointer',
});
const styles_wrap = css({
  '.ant-select-selection-item': {
    fontWeight: 'normal',
  },
  '.ant-modal-content': {
    borderRadius: '8px',
    paddingLeft: '16px',
    paddingRight: '16px',
  },
  '.ant-modal-footer': {
    color: '#3955f6',
  },
});
const styles_header = css({
  display: 'flex',
  alignItems: 'center',
});
const styles_footer = css({
  display: 'flex',
  justifyContent: 'flex-start',
});

export default function Previewer({
  httpUrl,
  originSize,
  platform,
  typeOfPlay,
  onClose,
}: {
  httpUrl: string;
  originSize?: [number, number];
  platform?: string;
  typeOfPlay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onClose(): void;
}) {
  const resolutions = getResolutions(typeOfPlay, originSize);
  const [previewDevice_ = 0, setPreviewDevice] = useStorage<number>('useStorage.previewer.device', 0);
  const previewDevice = previewDevice_ % resolutions.length;
  const [checked = true, setChecked] = useStorage<boolean>('useStorage.previewer.landscape', true);
  const [visibleMask, setVisibleMask] = useStorage<boolean>('popup.previewer.playable.mask', false);
  const [eventTracking, setEventTracking] = useState<boolean>(false);
  const [trackedEvents, setTrackedEvents] = useState<any[]>([]);
  const eventDurationRef = useRef(Date.now());
  const [previewId, setPreviewId] = useState(0);
  const [debug, setDebug] = useState(false);
  const ref = useRef<HTMLIFrameElement>(null);
  useLayoutEffect(() => {
    eventDurationRef.current = Date.now();
  }, [previewId, previewDevice]);
  useEffect(() => {
    if (trackedEvents.length === 0) {
      setPreviewId(id => id + 1);
    }
  }, [trackedEvents]);

  const url = useMemo(() => {
    const url = new URL(httpUrl);
    if (debug) {
      url.searchParams.set('debug', 'true');
    }
    url.searchParams.set('hidden_event_console', '1');
    return url.href;
  }, [httpUrl, debug]);

  let [previewH, previewW] = resolutions[previewDevice].resolution;
  const { android } = resolutions[previewDevice];
  if (!checked && typeOfPlay !== 3) {
    [previewH, previewW] = [previewW, previewH];
  }
  return (
    <>
      <Modal
        open
        centered
        destroyOnClose
        closable={false}
        width={previewW + 32}
        bodyStyle={{ padding: 0, margin: 0, height: previewH, width: previewW, borderRadius: '8px' }}
        wrapClassName={styles_wrap}
        style={eventTracking ? { transform: 'translateX(-350px)' } : {}}
        onCancel={onClose}
        title={
          <div className={styles_header}>
            <div className={styles_select}>
              <Select
                defaultValue={previewDevice}
                style={{ maxWidth: 120 }}
                onChange={device => {
                  setPreviewDevice(device);
                }}
              >
                {resolutions.map(({ title }, index) => (
                  <Select.Option key={index} value={index}>
                    {title}
                  </Select.Option>
                ))}
              </Select>
            </div>
            {typeOfPlay === 3 && (
              <IconButton
                title="互动直出遮罩"
                Icon={Mask}
                clicked={visibleMask}
                onClick={() => {
                  setVisibleMask(visibleMask => !visibleMask);
                  setPreviewId(id => id + 1);
                }}
              />
            )}
            {typeOfPlay !== 3 && (
              <IconButton
                title="切换横屏/竖屏"
                Icon={Rotate}
                onClick={() => {
                  setChecked(checked => !checked);
                  setPreviewId(id => id + 1);
                }}
              />
            )}
            <IconButton
              title="重新播放"
              Icon={(props: any) => <ReplayMusic theme="filled" {...props} />}
              onClick={() => {
                setPreviewId(id => id + 1);
              }}
            />
            <RecordVideo iframe={ref} iframeKey={`${previewDevice}:${previewId}`} />
            <IconButton
              title={trackedEvents.length > 0 ? '埋点日志' : '正在加载埋点数据···'}
              Icon={trackedEvents.length > 0 ? (props: any) => <Log theme="filled" {...props} /> : Log}
              onClick={() => {
                trackedEvents.length > 0 && setEventTracking(true);
                // 埋点可视化面板使用次数埋点
                collectEvent(EventTypes.EventTracking, null);
              }}
            />
            {amIHere({ release: false }) && (
              <IconButton
                title={debug ? '关闭调试模式' : '打开调试模式'}
                Icon={(props: any) => <Bug theme="filled" {...props} />}
                clicked={debug}
                onClick={() => {
                  setPreviewId(id => id + 1);
                  setDebug(!debug);
                }}
              />
            )}
            {(() => {
              const newUrl = new URL(url);
              newUrl.searchParams.set('refer', 'scan');
              newUrl.searchParams.set('is_playable', '1');
              const qrCode = useQRCode(newUrl.href, { width: 132 * 2 });

              return (
                !url.includes('type=preview') &&
                !location.pathname.includes('/playable') && (
                  <Dropdown
                    overlay={
                      <Card hoverable bodyStyle={{ width: 'auto', textAlign: 'center', padding: 16 }}>
                        <img src={qrCode} alt="预览二维码" />
                        <div>请用「抖音」App扫码预览</div>
                        <div style={{ color: '#999', fontSize: 12, paddingTop: 3 }}>「抖音」请用21.6.0以上版本扫码</div>
                      </Card>
                    }
                    children={IconButton({
                      title: '新标签打开',
                      Icon: Share,
                      href: newUrl.href,
                    })}
                  />
                )
              );
            })()}
          </div>
        }
        footer={
          <div className={styles_footer}>
            <a href="https://bytedance.feishu.cn/docs/doccnoaMwBBGL5myLuHzjkNppf1" target="_blank">
              如何适配各机型？
            </a>
          </div>
        }
      >
        <PreviewerContent
          ref={ref}
          width={previewW}
          height={previewH}
          onAndroid={android}
          key={`${previewDevice}:${previewId}`}
          httpUrl={platform ? `${url}` : `${url}&recorder=true&previewMode=true`}
          mask12={visibleMask && typeOfPlay === 3 ? previewH / previewW > 2 : undefined}
          onEventTracked={event => {
            setTrackedEvents(events => {
              const newEvents = [event].concat(events);
              if (
                event.eventName === 'loadMainScene' &&
                newEvents.slice(0, 3).reduce((total, { duration }) => total + duration, 0) > 5 * 1000
              ) {
                message.warning('进入首场景的时长超过5秒');
              }
              return newEvents;
            });
          }}
          onReplay={() => {
            setPreviewId(id => id + 1);
          }}
        />
        <div style={{ position: 'absolute', right: -16, top: 0, transform: 'translateX(100%)', display: 'flex' }}>
          <IconClose
            className={styles_closeBtn}
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </Modal>
      {eventTracking && (
        <EventTrack
          trackedEvents={trackedEvents}
          setEventTracking={setEventTracking}
          setTrackedEvents={setTrackedEvents}
        />
      )}
    </>
  );
}

const RecordVideo = ({ iframe, iframeKey }: { iframe: React.RefObject<HTMLIFrameElement>; iframeKey: string }) => {
  const [recording, setRecording] = useState(false);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const { type, status } = event.data;
      if (type === 'StartRecord') {
        if (status) {
          setRecording(true);
        } else {
          message.error('无法录屏');
        }
      } else if (type === 'StopRecord') {
        if (status) {
          setRecording(false);
        } else {
          message.error('无法停止录屏');
        }
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    if (recording) {
      setRecording(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeKey]);

  const className = css({
    animation: `${keyframes`
      from {
        opacity:1;
      }
      50% {
        opacity:0.5;
      }
      to {
        opacity:1;
      }
    `} 1s ease infinite`,
  });

  return (
    <IconButton
      title={recording ? '停止录制' : '录制作品'}
      Icon={(props: any) => <Monitor theme="filled" {...props} />}
      className={recording ? className : undefined}
      clicked={recording}
      onClick={() => {
        if (recording) {
          iframe.current?.contentWindow?.postMessage('StopRecord', '*');
        } else {
          iframe.current?.contentWindow?.postMessage('StartRecord', '*');
        }
      }}
    />
  );
};

const IconButton = ({ title, onClick, clicked, Icon: Component, className, href }: any) => {
  return (
    <Tooltip title={title} placement="top" mouseEnterDelay={0.5}>
      <Button
        href={href}
        target="_blank"
        className={className}
        type={clicked ? 'link' : 'text'}
        icon={<Icon component={Component} />}
        onClick={onClick}
      />
    </Tooltip>
  );
};
