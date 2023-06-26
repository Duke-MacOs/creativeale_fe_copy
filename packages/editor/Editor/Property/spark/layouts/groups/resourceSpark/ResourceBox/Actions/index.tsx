import type { ResourceBoxProps } from '..';
import ImageCropModal from '@editor/Resource/upload/UploadFiles/Modal/ImageCropModal';
import { SettingConfig, Delete, Switch, Upload, More, Help } from '@icon-park/react';
import Icon, { GatewayOutlined, PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import ResourceChangerCreator from '@editor/common/ResourceChanger';
import { message, Dropdown, Menu, Modal, Tooltip } from 'antd';
import { changeEditor, useProject } from '@editor/aStore';
import { fromFiles } from '@editor/Resource/upload';
import { useStore } from 'react-redux';
import { absoluteUrl, relativeUrl } from '@shared/utils';
import { useState, Fragment } from 'react';
import { css } from 'emotion';
import render from './render';
import { uploadFile } from '@shared/api';

export const ResourceChanger = ResourceChangerCreator({ selector: '#editor-property' });

export interface ButtonsProps
  extends Pick<
    ResourceBoxProps,
    | 'url'
    | 'visitable'
    | 'deletable'
    | 'onAction'
    | 'onChange'
    | 'type'
    | 'name'
    | 'extra'
    | 'cover'
    | 'baseType'
    | 'hoverable'
    | 'onReplaceAll'
  > {
  plain?: boolean;
  originWidth?: number;
  originHeight?: number;
}

export default ({
  url,
  type,
  name,
  cover,
  extra,
  plain,
  visitable,
  deletable,
  baseType = type,
  hoverable,
  onAction,
  onChange,
  onReplaceAll,
}: ButtonsProps) => {
  const { dispatch } = useStore<EditorState, EditorAction>();
  const [visible, setVisible] = useState<0 | 1 | 2>(0);
  const [cropping, setCropping] = useState(false);
  const [playing, setPlaying] = useState(false);
  const projectId = useProject('id');
  const others = [
    type === 'Sprite' && render('裁剪', GatewayOutlined, () => setCropping(true)),
    type === 'Sprite' &&
      render('下载', DownloadOutlined, () => {
        const urlObj = new URL(absoluteUrl(url!));
        urlObj.searchParams.append('forceDownload', 'true');
        window.location.href = urlObj.href;
      }),
    ['Video', 'NativeVideo', 'PVAlphaVideo', 'AlphaVideo', 'NativeLoadingVideo'].includes(type) &&
      render('播放', PlayCircleOutlined, () => setPlaying(true)),
    baseType === 'Sprite' &&
      typeof extra?.width === 'number' &&
      typeof extra?.height === 'number' &&
      hoverable &&
      render('重置尺寸', GatewayOutlined, () => {
        const image = new Image();
        image.onload = () => {
          const { width, height } = image;
          onChange({ url, name, extra: { width, height } });
        };
        image.src = absoluteUrl(url!);
      }),
    deletable && render('删除', Delete, () => onChange({ url: '', name: undefined, cover: undefined }), plain),
    onReplaceAll &&
      url &&
      render(
        <>
          替换所有{' '}
          <Tooltip title="一键替换所有相同的URL为新URL">
            <Icon component={Help as any} />
          </Tooltip>
        </>,
        Delete,
        () => setVisible(2),
        plain
      ),
  ].filter(value => value && url);
  const button = visitable ? undefined : others.shift();
  return (
    <div
      className={css({
        display: 'flex',
        columnGap: 8,
      })}
    >
      {url ? render('替换', Switch, () => setVisible(1), plain) : render('上传', Upload, () => setVisible(1), plain)}
      {button}
      {others.length === 1 ? (
        others[0]
      ) : others.length > 0 ? (
        type === 'Sound' ? (
          others.map((item, index) => <Fragment key={index}>{item}</Fragment>)
        ) : (
          <Dropdown
            overlay={
              <Menu>
                {others.map((item, index) => (
                  <Menu.Item key={index}>{item}</Menu.Item>
                ))}
              </Menu>
            }
          >
            {render('更多', More)}
          </Dropdown>
        )
      ) : null}
      {visitable && render('设置', SettingConfig, () => onAction?.('visit'), plain, true)}
      {visible > 0 && (
        <ResourceChanger
          eleType={type as any}
          onChange={async ({ url, cover, name, extra = {}, orderId }) => {
            const commit = [onChange, onReplaceAll!][visible - 1];
            if (type === 'Sprite' && typeof url === 'string') {
              const image = new Image();
              image.onload = function () {
                const { width: originWidth, height: originHeight } = image;
                const { size } = extra;
                commit({ url: url as string, name, cover, size, originWidth, originHeight });
              };
              image.src = absoluteUrl(url!);
            } else if (type === 'Video' && typeof url === 'string') {
              try {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.crossOrigin = 'anonymous';
                await new Promise<void>(resolve => {
                  const callback = () => {
                    video.removeEventListener('canplay', callback);
                    resolve();
                  };
                  video.addEventListener('canplay', callback);
                  video.src = absoluteUrl(url!);
                });

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx2d = canvas.getContext('2d') as CanvasRenderingContext2D;
                ctx2d.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const poster: Blob = await new Promise(resolve => {
                  canvas.toBlob(
                    blob => {
                      resolve(blob as Blob);
                    },
                    'image/jpeg',
                    0.3
                  );
                });
                const { downloadUrl: cover } = await uploadFile(poster);
                if (cover) {
                  const { size } = extra;
                  commit({ url: url as string, name, cover, size, orderId, poster: relativeUrl(cover) });
                }
              } catch {
                commit({ url: url as string, name, cover, size: extra.size, orderId });
              }
            } else {
              const { size } = extra;
              commit({ url: url as string, name, cover, size, orderId });
            }
            setVisible(0);
          }}
          onClose={() => {
            setVisible(0);
          }}
        />
      )}
      {cropping && (
        <ImageCropModal
          cropResource={{ name, url: absoluteUrl(url as string) }}
          onCancel={() => setCropping(false)}
          onConfirm={async (blob: any, type: string) => {
            const file = new File([blob], `${name}.${type}`, { type: `image/${type}` });
            dispatch(changeEditor(0, { loading: true }));
            try {
              const withAccepted = await fromFiles([file], { projectId });
              if (withAccepted) {
                await withAccepted()
                  .then(([{ url }]) => {
                    return new Promise(resolve => {
                      const image = new Image();
                      image.onload = function () {
                        onChange({
                          url: relativeUrl(url),
                          name,
                          cover,
                          size: blob.size,
                          originWidth: image.width,
                          originHeight: image.height,
                        });
                        resolve(image);
                      };
                      image.src = url;
                    });
                  })
                  .catch(() => {
                    message.error('图片上传失败！');
                  });
              }
            } finally {
              dispatch(changeEditor(0, { loading: false }));
              setCropping(false);
            }
          }}
        />
      )}
      {playing && (
        <Modal
          open
          destroyOnClose
          footer={null}
          width={375}
          title="视频素材播放"
          onCancel={() => {
            setPlaying(false);
          }}
        >
          <video autoPlay src={absoluteUrl(url!)} width="100%" controls style={{ objectFit: 'contain' }} />
        </Modal>
      )}
    </div>
  );
};
