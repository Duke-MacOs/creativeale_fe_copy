import React, { useEffect, useState } from 'react';
import { Button, message, Progress, Radio, Space } from 'antd';
import create from 'zustand';
import style from './style';
import {
  CheckSquareFilled,
  CloseOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  UploadOutlined,
} from '@ant-design/icons';
import { ReactComponent as defaultAudioImage } from '@shared/assets/images/default_audio.svg';
import { ReactComponent as defaultVideoImage } from '@shared/assets/images/default_video.svg';
import { processFile, preview, onCancel } from './fn';
interface ModalProps {
  list: File[];
  onFinish(files: File[]): void;
}
export const useProcessData = create(set => ({
  processPercent: [],
  completeFiles: [],
  processQuality: [],
  setProcessPercent: (newPercent: any) => set(() => ({ processPercent: newPercent })),
  setCompleteFiles: (newCompleteFiles: any) => set(() => ({ completeFiles: newCompleteFiles })),
  setProcessQuality: (newProcessQuality: any) => set(() => ({ processQuality: newProcessQuality })),
}));
export default ({ list, onFinish }: ModalProps) => {
  const [processList, setProcessList] = useState<File[]>(list);
  const [processIndex, setProcessIndex] = useState<number>(0);
  const [preList, setPreList] = useState<{ index: number; src: string; type: string }[]>([]);
  const [typeList, setTypeList] = useState<{ index: number; type: string }[]>([]);
  const [confirmIndex, setConfirmIndex] = useState<number[]>([]);
  const [confirmFiles, setConfirmFiles] = useState<File[]>([]);
  const [play, setPlay] = useState<boolean>(false);

  const processPercent = useProcessData((state: any) => state.processPercent);
  const setProcessPercent = useProcessData((state: any) => state.setProcessPercent);
  const completeFiles = useProcessData((state: any) => state.completeFiles);
  const setCompleteFiles = useProcessData((state: any) => state.setCompleteFiles);
  const processQuality = useProcessData((state: any) => state.processQuality);
  const setProcessQuality = useProcessData((state: any) => state.setProcessQuality);
  useEffect(() => {
    preview(processList, setPreList, setTypeList, setProcessList);
  }, []);
  useEffect(() => {
    const tempType = processList[processIndex].type === 'image/png' ? 'png' : 'jpeg';
    processList.forEach((file, index) => {
      processFile(
        index,
        file,
        8,
        tempType,
        processQuality,
        setProcessQuality,
        completeFiles,
        setCompleteFiles,
        processPercent,
        setProcessPercent
      ).catch(e => {
        console.log('!:', e);
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (confirmIndex.length === processList.length) {
      onCancel(confirmIndex, processList, onFinish, confirmFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmIndex]);
  return (
    <>
      <div className={style.header}>
        <h2>处理结果</h2>
        <CloseOutlined
          style={{ position: 'absolute', top: '10px', right: '10px' }}
          onClick={() => onCancel(confirmIndex, processList, onFinish, confirmFiles)}
        />
      </div>
      <div className={style.wrapper}>
        {/* 左侧列表区 */}
        <div className={style.list}>
          {processList.map((item, index) => {
            return (
              <div
                key={index}
                className={style.videoWrapper}
                style={{
                  border: processIndex === index ? '2px solid #1890ff' : 'none',
                }}
                onClick={e => {
                  e.preventDefault();
                  if (processIndex !== index) {
                    setProcessIndex(index);
                  }
                }}
              >
                {/* 视频 */}
                {item.type.startsWith('video') && (
                  <div
                    className={style.video}
                    onMouseLeave={() => {
                      setPlay(false);
                      const Video = document.getElementById(`${index}`) as any;
                      Video?.pause();
                    }}
                  >
                    {['video/mp4', 'video/webm', 'video/ogg'].includes(
                      preList.filter(item => item.index === index)[0]?.type
                    ) ? (
                      <>
                        <video
                          id={`${index}`}
                          src={preList.filter(item => item.index === index)[0]?.src}
                          width="100%"
                          height="100%"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        {!play && index === processIndex && (
                          <PlayCircleFilled
                            className={style.videoPlay}
                            onClick={() => {
                              const Video = document.getElementById(`${index}`) as any;
                              setPlay(true);
                              Video?.play();
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <img width="100%" height="100%" src={defaultVideoImage as any} />
                    )}
                    {play && index === processIndex && (
                      <PauseCircleFilled
                        className={style.videoPlay}
                        onClick={() => {
                          const Video = document.getElementById(`${index}`) as any;
                          setPlay(false);
                          Video?.pause();
                        }}
                      />
                    )}
                  </div>
                )}
                {/* 音频 */}
                {item.type.startsWith('audio') && (
                  <div className={style.audioContent}>
                    <img className={style.audioCover} src={defaultAudioImage as any} />
                    <audio
                      src={preList.filter(item => item.index === index)[0]?.src}
                      controls
                      className={style.audio}
                    />
                  </div>
                )}
                {/* 图片 */}
                {item.type.startsWith('image') && (
                  <img src={preList.filter(item => item.index === index)[0]?.src} className={style.video} />
                )}
                {confirmIndex.includes(index) && (
                  <div className={style.mask}>
                    <CheckSquareFilled className={style.completeIcon} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={style.centerAndRight}>
          {/* 中间预览区 */}
          <div className={style.center}>
            {processPercent[processIndex] !== 100 ? (
              <Progress percent={processPercent[processIndex]} status="active" className={style.tip} />
            ) : (
              <>
                {processList[processIndex].type.startsWith('video') && (
                  <video
                    className={style.previewVideo}
                    controls
                    src={completeFiles.filter((item: any) => item.index === processIndex)[0]?.src}
                  />
                )}
                {processList[processIndex].type.startsWith('audio') && (
                  <div className={style.previewAudioWrapper}>
                    <img src={defaultAudioImage as any} className={style.previewAudioCover} />
                    <audio
                      className={style.previewAudio}
                      controls
                      src={completeFiles.filter((item: any) => item.index === processIndex)[0]?.src}
                    />
                  </div>
                )}
                {processList[processIndex].type.startsWith('image') && (
                  <img
                    className={style.previewImage}
                    src={completeFiles.filter((item: any) => item.index === processIndex)[0]?.src}
                  />
                )}
                <div className={style.info}>
                  <span>名称：{completeFiles.filter((item: any) => item.index === processIndex)[0]?.file?.name}</span>
                  <span>
                    大小：
                    {(
                      (completeFiles.filter((item: any) => item.index === processIndex)[0]?.file?.size ?? 0) /
                      (1024 * 1024)
                    ).toFixed(2)}
                    MB
                  </span>
                  {!processList[processIndex].type.startsWith('image') && (
                    <span>
                      时长：
                      {Number(completeFiles.filter((item: any) => item.index === processIndex)[0]?.duration).toFixed(2)}
                      s
                    </span>
                  )}
                  {processList[processIndex].type.startsWith('video') && (
                    <span>
                      尺寸：{completeFiles.filter((item: any) => item.index === processIndex)[0]?.width} *
                      {completeFiles.filter((item: any) => item.index === processIndex)[0]?.height}
                    </span>
                  )}
                  {processList[processIndex].type.startsWith('image') && (
                    <span>格式：{completeFiles.filter((item: any) => item.index === processIndex)[0]?.type}</span>
                  )}
                </div>
              </>
            )}
          </div>
          {/* 右侧属性区 */}
          <div className={style.right}>
            <h2>压缩质量</h2>
            <Radio.Group
              disabled={
                completeFiles.findIndex((item: any) => item.index === processIndex) === -1 ||
                confirmIndex.includes(processIndex)
              }
              onChange={e => {
                processFile(
                  processIndex,
                  processList[processIndex],
                  e.target.value,
                  typeList.filter(item => item.index === processIndex)[0]?.type,
                  processQuality,
                  setProcessQuality,
                  completeFiles,
                  setCompleteFiles,
                  processPercent,
                  setProcessPercent
                );
              }}
              defaultValue={8}
              value={processQuality.filter((item: any) => item.index === processIndex)[0]?.quality ?? 8}
            >
              <Space direction="vertical">
                <Radio value={8}>高</Radio>
                <Radio value={6}>中</Radio>
                <Radio value={4}>低</Radio>
              </Space>
            </Radio.Group>
            {processList[processIndex].type.startsWith('image') && (
              <>
                <h2>图片格式</h2>
                <Radio.Group
                  disabled={
                    completeFiles.findIndex((item: any) => item.index === processIndex) === -1 ||
                    confirmIndex.includes(processIndex)
                  }
                  onChange={e => {
                    const newTypeList = typeList;
                    const index = newTypeList.findIndex(item => item.index === processIndex);
                    newTypeList[index].type = e.target.value;
                    setTypeList(newTypeList);
                    processFile(
                      processIndex,
                      processList[processIndex],
                      processQuality.filter((item: any) => item.index === processIndex)[0]?.quality ?? 8,
                      e.target.value,
                      processQuality,
                      setProcessQuality,
                      completeFiles,
                      setCompleteFiles,
                      processPercent,
                      setProcessPercent
                    );
                  }}
                  defaultValue={processList[processIndex].type === 'image/png' ? 'png' : 'jpeg'}
                  value={typeList.filter(item => item.index === processIndex)[0]?.type ?? 'jpeg'}
                >
                  <Space direction="vertical">
                    <Radio value="jpeg">jpeg格式</Radio>
                    <Radio value="png">png格式</Radio>
                  </Space>
                </Radio.Group>
              </>
            )}
            <Button
              disabled={
                processPercent[processIndex] !== 100 ||
                confirmIndex.includes(processIndex) ||
                completeFiles.filter((item: any) => item.index === processIndex)[0]?.error
              }
              type="primary"
              shape="round"
              icon={<UploadOutlined />}
              size="middle"
              className={style.uploadBtn}
              onClick={async () => {
                const type = completeFiles.filter((item: any) => item.index === processIndex)[0]?.type;
                const size = completeFiles.filter((item: any) => item.index === processIndex)[0]?.file.size as number;
                if (size === 0) {
                  message.warning('文件错误');
                } else if (type === 'mp4' && size > 10 * 1024 * 1024) {
                  message.warning('视频大小不能超过10M');
                } else if (type === 'mp3' && size > 2 * 1024 * 1024) {
                  message.warning('音频大小不能超过2M');
                } else if (['png', 'jpeg'].includes(type as string) && size > 1 * 1024 * 1024) {
                  message.warning('图片大小不能超过1M');
                } else {
                  setConfirmIndex([...confirmIndex, processIndex]);
                  setConfirmFiles([
                    ...confirmFiles,
                    completeFiles.filter((item: any) => item.index === processIndex)[0]?.file,
                  ]);
                }
              }}
            >
              确定
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
