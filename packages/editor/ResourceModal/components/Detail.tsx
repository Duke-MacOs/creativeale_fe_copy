import MaterialCover from '@shared/components/MaterialCover';
import { byteConvert } from '@shared/utils/byteConvert';
import { Modal } from 'antd';
import { css } from 'emotion';
import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import shallow from 'zustand/shallow';
import { useDetail } from '../Context';
import { IData } from '../type';
import {
  convertRikoPreviewCategory,
  getResourceMime,
  isResourceComponent,
  isResourceEffect,
} from '@shared/utils/resource';

const Extra = ({ data, duration }: { data: IData; duration: number }) => {
  const { description, extra = {} } = data;
  const { ext, size, width, height, usedCount, viewDetailCount, extraDuration } = extra;
  return (
    <div
      style={{
        width: '250px',
        position: 'relative',
        maxHeight: '650px',
        overflowY: 'scroll',
        padding: '10px 20px',
        backgroundColor: '#00000087',
        color: 'white',
      }}
    >
      <p>名称：{data.name}</p>
      {description && <p>描述：{description}</p>}
      {ext && <p>格式：{ext}</p>}
      {size && <p>大小：{byteConvert(size)}</p>}
      {width && height && (
        <p>
          分辨率：{data.extra.width} * {data.extra.height}
        </p>
      )}
      {(duration !== 0 || extraDuration) && <p>时长：{Math.floor(extraDuration || duration)}s</p>}
      {usedCount && <p>使用次数：{usedCount}</p>}
      {viewDetailCount && <p>查看次数：{viewDetailCount}</p>}
    </div>
  );
};

export default React.memo(() => {
  const coverRef = useRef(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { detail: data, updateDetail } = useDetail(state => state, shallow);
  const [duration, setDuration] = useState<number>(0);
  const [customStyle, setCustomStyle] = useState({ width: '450px', height: '450px' });

  const showType =
    isResourceEffect({ id: data?.type.cid }) || isResourceComponent({ id: data?.type.cid }) ? 'riko' : 'cover';

  useEffect(() => {
    setDuration(0);
    data && showType === 'riko' && onEffectPreviewStart(data);
  }, [data]);

  const onEffectPreviewStart = (data: IData) => {
    setCustomStyle({ width: '450px', height: '450px' });
    data &&
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          type: 'change',
          url: data.previewUrl,
          projectType: convertRikoPreviewCategory(getResourceMime(data.type.cid)),
          loop: true,
        }),
        '*'
      );
  };

  const onClose = () => {
    updateDetail(undefined);
  };

  // Modal 方案
  const onLoadFinish = (instance?: HTMLImageElement | HTMLVideoElement | HTMLAudioElement) => {
    const MinSize = 300;
    const DefaultSize = instance instanceof HTMLImageElement || instance instanceof HTMLVideoElement ? 650 : 450;

    let width = DefaultSize;
    let height = DefaultSize;
    if (instance instanceof HTMLImageElement) {
      width = instance.naturalWidth;
      height = instance.naturalHeight;
    } else if (instance instanceof HTMLVideoElement) {
      width = instance.videoWidth;
      height = instance.videoHeight;
      setDuration(instance.duration);
    } else if (instance instanceof HTMLAudioElement) {
      setDuration(instance.duration);
    }
    const ratio = width / height;
    setCustomStyle({
      width: `${Math.max(width > height ? DefaultSize : ratio * DefaultSize, MinSize)}px`,
      height: `${Math.max(width > height ? DefaultSize / ratio : DefaultSize, MinSize)}px`,
    });
  };

  return (
    <Modal
      title={null}
      className={css({
        '.ant-modal-content': {
          overflow: 'hidden',
        },
        '.ant-modal-body': {
          padding: '0',
        },
      })}
      width="auto"
      zIndex={2000}
      getContainer={false}
      closable={false}
      visible={data !== undefined}
      footer={null}
      centered={true}
      onCancel={onClose}
    >
      {data ? (
        <div style={{ display: 'flex' }}>
          <div ref={coverRef} style={{ ...customStyle, alignSelf: 'center' }}>
            <iframe
              ref={iframeRef}
              src={`https://magicplay.oceanengine.com/static-cloud/invoke/riko_player?type=preload`}
              allow="autoplay"
              frameBorder="0"
              style={{
                position: showType === 'riko' ? 'relative' : 'absolute',
                width: showType === 'riko' ? '100%' : '0px',
                height: showType === 'riko' ? '100%' : '0px',
                left: showType === 'riko' ? '0' : '9999px',
                visibility: showType === 'riko' ? 'visible' : 'hidden',
              }}
              onLoad={() => {
                showType === 'riko' && onEffectPreviewStart(data);
              }}
            />
            {showType === 'cover' && (
              <MaterialCover
                data={data}
                CoverBoxRef={coverRef}
                customStyle={{ width: '100%', height: '100%' }}
                onLoad={onLoadFinish}
              />
            )}
          </div>
          <Extra data={data} duration={duration} />
        </div>
      ) : null}
    </Modal>
  );
});
