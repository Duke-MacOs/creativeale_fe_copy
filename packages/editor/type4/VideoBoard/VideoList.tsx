import { W, H } from '@editor/type4/StoryBoard/nodeTypes';
import { UploadEntry, UploadFilesBase } from '@editor/Resource/upload';
import { useState, SetStateAction, Dispatch } from 'react';
import { CloseCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { filenameSorter } from '@editor/utils';
import { Spin, Typography } from 'antd';
import { css, cx } from 'emotion';

export interface VideoListProps {
  setVideoEntries: Dispatch<SetStateAction<UploadEntry[]>>;
  videoEntries: UploadEntry[];
  projectId: number;
}

export default ({ projectId, videoEntries, setVideoEntries }: VideoListProps) => {
  return (
    <div className={css({ display: 'flex', columnGap: 16, rowGap: 24, flexWrap: 'wrap' })}>
      {videoEntries.map(({ id, url, name }: any) => (
        <div
          key={id}
          className={css({
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            textAlign: 'center',
            borderRadius: 4,
          })}
        >
          <CloseCircleOutlined
            style={{ position: 'absolute', right: 0, cursor: 'pointer', zIndex: 100 }}
            onClick={() => setVideoEntries(videoEntries.filter(item => item.id !== id))}
          />
          <video
            src={url}
            className={css({ width: W, height: H, objectFit: 'contain', display: 'block', background: '#eee' })}
          />
          <Typography.Text
            type="secondary"
            className={css({ width: W, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}
          >
            {name}
          </Typography.Text>
        </div>
      ))}
      <UploadVideo projectId={projectId} empty={!videoEntries.length} setVideoEntries={setVideoEntries} />
    </div>
  );
};

const UploadVideo = ({
  projectId,
  empty,
  setVideoEntries,
}: Pick<VideoListProps, 'projectId' | 'setVideoEntries'> & { empty: boolean }) => {
  const [uploading, setUploading] = useState(false);
  return (
    <UploadFilesBase
      category="NativeVideo"
      dragger={empty}
      className={css({
        '& .ant-upload': {
          padding: '0 !important',
        },
      })}
      projectId={projectId}
      uploading={uploading}
      setUploading={setUploading}
      onAddResourceEntry={entry => {
        setVideoEntries(entries => {
          return entries.concat(entry).sort((e1, e2) => filenameSorter(e1.name, e2.name));
        });
      }}
    >
      <Spin spinning={uploading}>
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
              height: H,
              width: W,
            }),
            empty && css({ width: 1294, height: 750 })
          )}
        >
          <PlusCircleOutlined />
          <div>{empty ? '点击或拖拽到此处新增视频' : '新增视频'}</div>
        </Typography.Text>
      </Spin>
    </UploadFilesBase>
  );
};
