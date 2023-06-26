import React, { memo } from 'react';
import { message, Modal, Upload } from 'antd';
import { zipFrames, acceptedType, AcceptedType, AcceptedSize, AcceptedDims, getDims } from '@editor/Resource/upload';
import { collectEvent, EventTypes } from '@editor/utils';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import process from '@editor/Resource/upload/UploadFrame/process';
import { amIHere } from '@shared/utils';
export interface UploadFrameProps {
  className?: string;
  categoryId: string;
  uploading: boolean;
  teamId?: string;
  $scope?: string;
  children: React.ReactNode;
  onAddResourceEntry(entry: { id: number; mime: string; name: string; url: string; cover?: string }): any;
  setUploading(uploading: boolean): void;
}
export const UploadFrame = memo(
  ({
    onAddResourceEntry,
    setUploading,
    children,
    categoryId,
    uploading,
    className,
    teamId,
    $scope,
  }: UploadFrameProps) => {
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
                okText: '开始压缩',
                cancelText: '放弃上传',
                onOk: () => {
                  process({ fileList }).then(async (scale: any) => {
                    resolve(scale);
                  });
                },
              });
            });
          };
          const accepts = await acceptedType(fileList, 'FrameAnime');

          // 区分内外网
          if (amIHere({ release: true })) {
            if (accepts.length) {
              if (accepts.reduce((total, file) => total + file.size, 0) > AcceptedSize.FrameAnime) {
                message.error(`动画序列过大，不得超过${Math.round(AcceptedSize.FrameAnime / 1024 / 1024)}M`);
              } else {
                setUploading(true);
                zipFrames(accepts, { categoryId, teamId, $scope }, 'FrameAnime')
                  .then(async data => {
                    await onAddResourceEntry(data);
                  })
                  .catch(error => {
                    message.error(error.message);
                  })
                  .finally(() => {
                    setUploading(false);
                  });
              }
            }
          } else {
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
              zipFrames(accepts, { categoryId, teamId, $scope, scale: Number(frameScale) }, 'FrameAnime')
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
