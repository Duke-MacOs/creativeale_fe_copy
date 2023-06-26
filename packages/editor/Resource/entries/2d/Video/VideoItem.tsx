import React, { useEffect, useState, useRef } from 'react';
import { Input, Modal, Tooltip } from 'antd';
import { css } from 'emotion';
import useDraggable from '../../../common/useDraggable';
import Button from 'antd/es/button';
import dayjs from 'dayjs';
import Icon from '@ant-design/icons';
import { Delete, Download, Edit } from '@icon-park/react';
import { IMaterial } from '@/types/library';
import { Category, Provider } from '@editor/aStore';
import useRenameResourceEntry from '@editor/Resource/common/useRenameResourceEntry';
import Axios from 'axios';
import { downloadBlob } from '@editor/utils';
const className = css({
  cursor: 'pointer',
  marginBottom: '8px',
  background: '#F9F9F9',
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
});
const iconClassName = css({
  opacity: 0,
  [`.${className}:hover &, &-loading`]: {
    opacity: 1,
  },
});

export function VideoItem({
  videoData,
  onDelete,
  materialId,
  extra,
  groupData,
  setGroupData,
  provider,
  category,
}: {
  videoData: IMaterial;
  materialId?: string | number;
  extra?: Record<string, any>;
  onDelete?: () => Promise<void>;
  groupData: any;
  setGroupData: any;
  provider: Provider;
  category: Category;
}) {
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoPlayAsync = useRef<Promise<void> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newName, setNewName] = useState<string>(videoData.name);
  const [ifRename, setIfRename] = useState(false);
  const refInput = React.useRef<any>(null);
  const onRenameResourceEntry = useRenameResourceEntry();
  const rename = async () => {
    if (newName !== videoData.name && newName !== '') {
      await onRenameResourceEntry(category, provider, materialId!, newName, setGroupData, groupData);
    }
    setIfRename(false);
  };
  // 一点微小的防抖
  useEffect(() => {
    const timeOut = setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        if (playing) {
          videoPlayAsync.current = video.play();
        } else {
          videoPlayAsync.current = videoPlayAsync.current ?? Promise.resolve();
          videoPlayAsync.current
            .then(() => {
              video.currentTime = 0;
              video.pause();
              videoPlayAsync.current = null;
            })
            .catch(() => {
              console.log('视频播放失败');
            });
        }
      }
    }, 200);
    return () => {
      clearTimeout(timeOut);
    };
  }, [playing]);
  const dragProps = useDraggable({ mime: 'Video', url: videoData.previewUrl, name: videoData.name, materialId, extra });
  return (
    <div className={className} {...dragProps}>
      <video
        muted
        ref={videoRef}
        preload="metadata"
        style={{
          width: '100px',
          height: '76px',
          objectFit: 'contain',
        }}
        src={videoData.previewUrl}
        onMouseOver={() => setPlaying(true)}
        onMouseOut={() => setPlaying(false)}
        onLoadedMetadata={event => {
          setDuration((event.target as HTMLVideoElement).duration);
        }}
      />
      <div
        style={{
          flex: '1 1 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: '0',
        }}
      >
        {ifRename ? (
          <Input
            ref={refInput}
            type="text"
            defaultValue={videoData.name}
            autoFocus
            style={{ fontSize: 11, height: '20px' }}
            onChange={e => {
              setNewName(e.target.value);
            }}
            onBlur={rename}
            onPressEnter={rename}
            onClick={event => {
              event.stopPropagation();
            }}
          />
        ) : (
          <Tooltip title={videoData.name} placement="top">
            <div>{videoData.name}</div>
          </Tooltip>
        )}

        <div
          style={{
            fontSize: '10px',
            textAlign: 'center',
            opacity: 0.62,
          }}
        >
          时长：
          {dayjs(duration * 1000 || 0)
            .format('mm:ss.SSS')
            .slice(0, -2)}
        </div>
      </div>
      <div style={{ display: 'flex', width: '70px' }}>
        {provider === 'project' && (
          <Button
            type="text"
            loading={deleting}
            className={iconClassName}
            onClick={event => {
              event.stopPropagation();
              setIfRename(true);
            }}
            icon={<Icon component={Edit as any} />}
          />
        )}
        {provider === 'project' && (
          <Button
            type="text"
            className={iconClassName}
            onClick={event => {
              event.stopPropagation();
              const uri = videoData.previewUrl;
              const index = uri.lastIndexOf('.');
              const ext = uri.substr(index + 1);
              Axios({ url: `${uri}?forceDownload=true`, responseType: 'blob' }).then(res => {
                downloadBlob(res.data, `${videoData.name}.${ext}`);
              });
            }}
            icon={<Icon component={Download as any} />}
          />
        )}
        {onDelete && (
          <Button
            type="text"
            loading={deleting}
            onClick={event => {
              event.stopPropagation();
              Modal.confirm({
                title: `确定删除${videoData.name}吗？`,
                okText: '确定',
                cancelText: '取消',
                onOk() {
                  setDeleting(true);
                  onDelete().catch(() => {
                    setDeleting(false);
                  });
                },
              });
            }}
            icon={<Icon component={Delete as any} />}
          />
        )}
      </div>
    </div>
  );
}
