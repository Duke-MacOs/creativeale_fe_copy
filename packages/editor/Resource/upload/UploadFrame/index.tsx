import React, { memo } from 'react';
import { message, Modal, Upload } from 'antd';
import {
  AcceptedType,
  AcceptedSize,
  AcceptedDims,
  getDims,
  acceptedType,
  checkFileDims,
  checkFileType,
} from '../accepted';
import { collectEvent, EventTypes } from '@editor/utils';
import { useProject } from '@editor/aStore';
import { zipFrames } from './zipFrames';
import { ExclamationCircleOutlined } from '@ant-design/icons';
export * from './zipFrames';
import process from './process';
import { amIHere } from '@shared/utils';

export interface UploadFrameProps {
  className?: string;
  uploading: boolean;
  children: React.ReactNode;
  onAddResourceEntry(entry: {
    id: number;
    mime: string;
    name: string;
    url: string;
    cover?: string;
    extra?: Record<string, unknown>;
  }): any;
  setUploading(uploading: boolean): void;
}
export const UploadFrame = memo(
  ({ onAddResourceEntry, setUploading, children, uploading, className }: UploadFrameProps) => {
    const projectId = useProject('id');
    return (
      <Upload
        multiple
        disabled={uploading}
        showUploadList={false}
        className={className}
        accept={AcceptedType['FrameAnime']}
        beforeUpload={async (file, fileList) => {
          if (fileList.indexOf(file) !== fileList.length - 1) {
            return false;
          }
          collectEvent(EventTypes.UploadResource, {
            type: '用户上传量',
          });
          let frameScale = 1;
          const [maxWidth, maxHeight] = AcceptedDims['FrameAnime']!;
          const processFiles = async (reason?: string) => {
            return new Promise<number>(resolve => {
              Modal.confirm({
                centered: true,
                title: `序列帧压缩`,
                icon: <ExclamationCircleOutlined />,
                content: reason
                  ? `动画序列尺寸超过了${maxWidth}×${maxHeight}，是否压缩？`
                  : `动画序列过大，不得超过${Math.round(AcceptedSize.FrameAnime / 1024 / 1024)}M，是否压缩？`,
                okText: '开始',
                cancelText: '放弃',
                onOk: () => {
                  process({ fileList }).then(async (scale: any) => {
                    resolve(scale);
                  });
                },
              });
            });
          };

          // 区分内外网
          if (amIHere({ release: true })) {
            Promise.all(fileList.map(file => checkFileDims(checkFileType(file, 'FrameAnime'), 'FrameAnime')))
              .then(accepts => {
                if (accepts.reduce((total, file) => total + file.size, 0) > AcceptedSize.FrameAnime) {
                  message.error(`动画序列过大，不得超过${Math.round(AcceptedSize.FrameAnime / 1024 / 1024)}M`);
                } else {
                  setUploading(true);
                  zipFrames(accepts, { projectId }, 'FrameAnime')
                    .then(async data => {
                      collectEvent(EventTypes.UploadResource, {
                        type: '上传成功量',
                      });
                      await onAddResourceEntry(data);
                    })
                    .catch(error => {
                      message.error(error.message);
                    })
                    .finally(() => {
                      setUploading(false);
                    });
                }
              })
              .catch(error => {
                message.error(error.message);
              })
              .finally(() => {
                setUploading(false);
                frameScale = 1;
              });
          } else {
            const accepts = await acceptedType(fileList, 'FrameAnime');
            if (accepts.length) {
              const { width, height } = await getDims(accepts[0]);
              if (width * height > maxWidth * maxHeight) {
                await processFiles('overSize').then(scale => {
                  frameScale = scale;
                });
              } else if (accepts.reduce((total, file) => total + file.size, 0) > AcceptedSize.FrameAnime) {
                await processFiles().then(scale => {
                  frameScale = scale;
                });
              }
              setUploading(true);
              zipFrames(accepts, { projectId, scale: Number(frameScale) }, 'FrameAnime')
                .then(async data => {
                  await onAddResourceEntry(data);
                })
                .catch(error => {
                  message.error(error.message);
                })
                .finally(() => {
                  setUploading(false);
                  frameScale = 1;
                });
            }
          }

          return false;
        }}
      >
        {children}
      </Upload>
    );
  }
);
