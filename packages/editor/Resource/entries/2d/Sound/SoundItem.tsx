import React, { useEffect, useRef, useState } from 'react';
import { Input, message, Modal, Tooltip } from 'antd';
import { css } from 'emotion';
import dayjs from 'dayjs';
import Icon from '@ant-design/icons';
import { Acoustic, Delete, PlayOne, Edit, Download } from '@icon-park/react';
import useDraggable from '../../../common/useDraggable';
import Button from 'antd/es/button';
import { IMaterial } from '@/types/library';
import { Category, Provider } from '@editor/aStore';
import useRenameResourceEntry from '@editor/Resource/common/useRenameResourceEntry';
import Axios from 'axios';
import { downloadBlob } from '@editor/utils';

const className = css({
  marginBottom: '8px',
  height: '32px',
  background: '#f9f9f9',
  borderRadius: '2px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  cursor: 'pointer',
  '&:nth-last-child(1)': {
    marginBottom: 0,
  },
});
const iconClassName = css({
  opacity: 0,
  [`.${className}:hover &, &-loading`]: {
    opacity: 1,
  },
});

export function SoundItem({
  musicData,
  onDelete,
  materialId,
  groupData,
  setGroupData,
  provider,
  category,
}: {
  materialId?: string | number;
  musicData: IMaterial;
  onDelete?: () => Promise<void>;
  groupData: any;
  setGroupData: any;
  provider: Provider;
  category: Category;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlayAsync = useRef<Promise<void> | null>(null);
  const [audioTime, setAudioTime] = useState(0);
  const dragProps = useDraggable({ mime: 'Sound', url: musicData.previewUrl, name: musicData.name, materialId });
  const [deleting, setDeleting] = useState(false);
  const [newName, setNewName] = useState<string>(musicData.name);
  const [ifRename, setIfRename] = useState(false);
  const refInput = React.useRef<any>(null);
  const onRenameResourceEntry = useRenameResourceEntry();
  const rename = async () => {
    if (newName !== musicData.name && newName !== '') {
      await onRenameResourceEntry(category, provider, materialId!, newName, setGroupData, groupData);
    }
    setIfRename(false);
  };
  useEffect(() => {
    const timeOut = setTimeout(() => {
      const audio = audioRef.current;
      if (audio) {
        if (playing) {
          audioPlayAsync.current = audio.play();
        } else {
          audioPlayAsync.current = audioPlayAsync.current ?? Promise.resolve();
          audioPlayAsync.current
            .then(() => {
              audio.currentTime = 0;
              audio.pause();
              audioPlayAsync.current = null;
            })
            .catch(() => {
              console.log('音频播放失败');
            });
        }
      }
    }, 200);
    return () => {
      clearTimeout(timeOut);
    };
  }, [playing]);
  return (
    <div className={className} {...dragProps} onMouseOver={() => setPlaying(true)} onMouseOut={() => setPlaying(false)}>
      {playing ? <Icon component={Acoustic as any} /> : <Icon component={PlayOne as any} />}
      <div
        style={{ flex: '1 1 0', margin: '0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {ifRename ? (
          <Input
            ref={refInput}
            type="text"
            defaultValue={musicData.name}
            autoFocus
            style={{ fontSize: 11, height: '20px' }}
            onChange={e => {
              setNewName(e.target.value);
            }}
            onClick={event => {
              event.stopPropagation();
            }}
            onBlur={rename}
            onPressEnter={rename}
          />
        ) : (
          <Tooltip title={musicData.name}>
            <div>{musicData.name}</div>
          </Tooltip>
        )}
      </div>
      <div style={{ fontSize: '10px', opacity: 0.62, paddingRight: '4px' }}>
        {dayjs(audioTime * 1000 || 0)
          .format('mm:ss.SSS')
          .slice(0, -2)}
      </div>
      <div style={{ display: 'flex', width: '80px' }}>
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
        {provider === 'project' && category === 'Sound' && (
          <Button
            type="text"
            onClick={event => {
              event.stopPropagation();
              const uri = musicData.previewUrl;
              const index = uri.lastIndexOf('.');
              const ext = uri.substr(index + 1);
              Axios({ url: `${uri}?forceDownload=true`, responseType: 'blob' })
                .then(res => {
                  downloadBlob(res.data, `${musicData.name}.${ext}`);
                })
                .catch(e => {
                  message.error('下载失败');
                });
            }}
            className={iconClassName}
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
                title: `确定删除${musicData.name}吗？`,
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
      <audio
        src={musicData.previewUrl}
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={event => {
          setAudioTime((event.target as HTMLAudioElement).duration);
        }}
      />
    </div>
  );
}
