import React, { useEffect, useRef, useState } from 'react';
import { collectEvent, downloadUri, EventTypes } from '@editor/utils';
import { Close, Export } from '@icon-park/react';
import { SubmitProps } from '..';
import { message, Modal, Spin, Typography } from 'antd';
import Icon, { DeleteFilled, PauseCircleFilled, PlayCircleFilled, PlusCircleOutlined } from '@ant-design/icons';
import ExportDialog from './ExportDialog';
import HeaderButton from '../../HeaderButton';
import { useStore } from 'react-redux';
import { http } from '@shared/api';
import { ExportHistoryWrapper } from '../ExportHistory';
// import { VideoType, videoType } from '@editor/type4';
// import { absoluteUrl } from '@shared/utils';
import { css, cx } from 'emotion';
import { UploadFilesBase } from '@editor/Resource/upload';
import { setSettings, useSettings } from '@editor/aStore';

export default function ExportProject({ disabled, onSaving }: SubmitProps) {
  const [visible, setVisible] = useState(false);
  const [fallbackVideo, setFallbackVideo] = useState(false);
  const { getState } = useStore<EditorState, EditorAction>();

  return (
    <React.Fragment>
      <ExportHistoryWrapper>
        <HeaderButton
          icon={<Icon component={Export as any} />}
          disabled={disabled}
          onClick={async () => {
            collectEvent(EventTypes.OperationButton, {
              type: '导出',
            });
            try {
              await onSaving('导出');
              const { settings } = getState().project;
              if (settings.typeOfPlay !== 4) {
                setVisible(true);
              } else {
                setFallbackVideo(true);
              }
            } catch (e) {
              console.error(e);
              message.error(e.message);
            }
          }}
        >
          导出
        </HeaderButton>
      </ExportHistoryWrapper>
      {visible && <ExportDialog onSaving={onSaving} onCancel={() => setVisible(false)} />}
      {fallbackVideo && (
        <FallbackVideo
          onOk={async () => {
            try {
              const { id } = getState().project;
              // const scenes = getState().project.scenes.filter(({ type }) => type === 'Scene');
              // await Promise.all(
              //   scenes.map(
              //     async scene =>
              //       new Promise((resolve, reject) => {
              //         const type = videoType(scene.orderId, scenes);
              //         const video = intoScene(scene).nodes?.find(({ type }) => type === 'PVVideo');
              //         const audio = new Audio(absoluteUrl(video!.props!.url as any));
              //         audio.addEventListener('loadedmetadata', () => {
              //           if (type !== VideoType.Loop && audio.duration < 2) {
              //             reject(new Error(`非循环视频"${scene.name}"的时长不能小于2秒`));
              //           } else {
              //             resolve(audio.duration);
              //           }
              //         });

              //         audio.addEventListener('error', () => {
              //           reject('发生异常，请重新导出');
              //         });
              //       })
              //   )
              // );

              const {
                data: { data: task },
              } = await http.post('project/syncToAdCompress', {
                id,
                extra: {},
                imageQuality: 8,
                videoQuality: 8,
                audioQuality: 8,
              });
              while (true) {
                const {
                  data: { data },
                } = await new Promise<any>((resolve, reject) => {
                  setTimeout(async () => {
                    try {
                      resolve(await http.get(`project/syncToAdCompressResult?id=${id}&taskId=${task.id}`));
                    } catch (e) {
                      reject(e);
                    }
                  }, 3000);
                });
                if (data.status === 1) {
                  downloadUri(data.url);
                  break;
                } else if (data.status === 2) {
                  throw new Error('压缩失败');
                }
              }
            } catch (error) {
              message.error(error.message);
            }
          }}
          onCancel={() => setFallbackVideo(false)}
          onSaving={onSaving}
        />
      )}
    </React.Fragment>
  );
}

function FallbackVideo({
  onOk,
  onCancel,
  onSaving,
}: {
  onOk: () => Promise<void>;
  onCancel: () => void;
  onSaving(action?: string): Promise<void>;
}) {
  const { getState, dispatch } = useStore();
  const projectId = getState().project.id;
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitting] = useState(false);
  const fallbackVideo = useSettings('fallbackVideo');
  const videoRef = useRef<HTMLVideoElement>(null);

  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (playing) {
        video.currentTime = 0;
        video.play();
      } else {
        video.pause();
      }
    }
  }, [playing]);
  const PlayIcon = playing ? PauseCircleFilled : PlayCircleFilled;

  const W = 1080 / 4;
  const H = 1920 / 4;

  return (
    <Modal
      open
      width={W + 2 * 24}
      title="兜底视频上传"
      closeIcon={<Icon component={Close as any} />}
      okText="导出"
      cancelText="取消"
      okButtonProps={{ loading: submitLoading, disabled: !fallbackVideo }}
      onCancel={onCancel}
      onOk={async () => {
        setSubmitting(true);
        try {
          await onSaving('导出');
          await onOk();
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <UploadFilesBase
        category="NativeVideo"
        className={css({
          '& .ant-upload': {
            padding: '0 !important',
          },
          cursor: 'pointer',
        })}
        projectId={projectId}
        uploading={uploading}
        setUploading={setUploading}
        onAddResourceEntry={entry => {
          if (videoRef.current) {
            videoRef.current.pause();
          }
          dispatch(setSettings({ fallbackVideo: entry.url }));
        }}
      >
        <Spin spinning={uploading}>
          {fallbackVideo ? (
            <div
              className={css({
                width: W,
                height: H,
                position: 'relative',
              })}
            >
              <video
                ref={videoRef}
                src={fallbackVideo}
                className={css({ width: W, height: H, objectFit: 'contain', display: 'block', background: '#eee' })}
              />
              <PlayIcon
                className={css({
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  color: '#fff',
                  transform: 'translate(-50%, -50%)',
                  transition: '200ms',
                  cursor: 'pointer',
                  fontSize: 36,
                  opacity: 0,
                  '&:hover': {
                    opacity: 1,
                  },
                })}
                onClick={event => {
                  event.stopPropagation();
                  if (videoRef.current) {
                    setPlaying(playing => !playing);
                  }
                }}
              />
              <DeleteFilled
                className={css({
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  cursor: 'pointer',
                  fontSize: 20,
                })}
                onClick={event => {
                  event.stopPropagation();
                  if (videoRef.current) {
                    setPlaying(false);
                    dispatch(setSettings({ fallbackVideo: undefined }));
                  }
                }}
              />
            </div>
          ) : (
            <Typography.Text
              type="secondary"
              className={cx(
                css({
                  display: 'flex',
                  cursor: 'pointer',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#eee',
                  borderRadius: 4,
                  rowGap: 12,
                  width: W,
                  height: H,
                })
              )}
            >
              <PlusCircleOutlined />
              <div>上传视频</div>
            </Typography.Text>
          )}
        </Spin>
      </UploadFilesBase>
    </Modal>
  );
}
