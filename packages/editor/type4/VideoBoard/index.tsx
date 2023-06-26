import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useFullscreen } from '@byted/hooks';
import { ISceneState } from '@editor/aStore';
import { UploadEntry } from '@editor/Resource/upload';
import { filenameSorter } from '@editor/utils';
import { Button, message, Space, Steps, Tooltip, Upload } from 'antd';
import { css } from 'emotion';
import JSZip from 'jszip';
import { useState } from 'react';
import ReactFlow, { Background, ControlButton, Controls } from 'react-flow-renderer';
import nodeTypes from '../StoryBoard/nodeTypes';
import { videoEdit } from './api/video_edit';
import edgeTypes from './edgeTypes';
import { fromNodeEdges } from './fromNodeEdges';
import useBoardHotKeys from './useBoardHotKeys';
import { useNodeEdges } from './useNodeEdges';
import VideoList from './VideoList';
import { fromFiles } from '@editor/Resource/upload';

export default ({ projectId, onFinish }: { projectId: number; onFinish(scenes: ISceneState[]): void }) => {
  const [current, setCurrent] = useState(0);
  const [videos, setVideos] = useState<UploadEntry[]>([]);
  const { nodes, edges, onNodesChange, onConnect, onEdgesChange } = useNodeEdges(current ? videos : []);
  const { ref, isFullscreen, setFull, exitFull } = useFullscreen();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  useBoardHotKeys(nodes, setVideos);

  const steps = [
    {
      title: '上传视频',
      subTitle: '至少上传两个',
      nextDisabled: videos.length < 2,
      Component: <VideoList projectId={projectId} videoEntries={videos} setVideoEntries={setVideos} />,
    },
    {
      title: '连线视频',
      subTitle: '至少一条连线',
      nextClick: async () => {
        try {
          setLoading(true);
          onFinish(await fromNodeEdges(videos, nodes, edges));
        } catch (error) {
          message.error(error.message);
        } finally {
          setLoading(false);
        }
      },
      Component: (
        <ReactFlow
          fitView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          attributionPosition="bottom-left"
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Background />
          <Controls showInteractive={false} style={{ bottom: 32 }}>
            <ControlButton
              onClick={() => {
                if (isFullscreen) {
                  exitFull();
                } else {
                  setFull();
                }
              }}
            >
              <Tooltip
                getPopupContainer={() => ref!.current!}
                title={isFullscreen ? '退出全屏' : '进入全屏'}
                placement="right"
              >
                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </Tooltip>
            </ControlButton>
          </Controls>
        </ReactFlow>
      ),
    },
  ];
  return (
    <div className={css({ position: 'relative' })}>
      <div className={css({ width: '62%', margin: '24px auto 16px' })}>
        <Steps current={current}>
          {steps.map(({ title, subTitle }, index) => (
            <Steps.Step
              key={index}
              title={title}
              subTitle={subTitle}
              disabled={index > current}
              onStepClick={() => {
                if (index <= current) {
                  setCurrent(index);
                }
              }}
            />
          ))}
        </Steps>
      </div>
      <div ref={ref} className={css({ flex: 1, width: '100%', height: 750 })}>
        {steps[current].Component}
      </div>
      <Space className={css({ width: '100%', justifyContent: 'flex-end', paddingTop: 16 })}>
        {!current && (
          <Upload
            multiple={false}
            showUploadList={false}
            disabled={uploadLoading}
            beforeUpload={async file => {
              try {
                setUploadLoading(true);
                const res = await videoEdit(file);
                const buffer = new Uint8Array(res.video_data.data).buffer;
                const zip = await JSZip.loadAsync(buffer);
                const pArr: Array<Promise<File>> = [];
                zip.folder('resources')?.forEach((path, file) => {
                  pArr.push(
                    file.async('blob').then(blob => {
                      return new File([blob], path, { type: 'video/mp4' });
                    })
                  );
                });
                console.log('response', res);
                const files = await Promise.all(pArr);
                const withAccepted = await fromFiles(files, { projectId, isTeam: false }, 'NativeVideo');
                if (withAccepted) {
                  await withAccepted().then(entry => {
                    setVideos(entries => {
                      return entries.concat(entry).sort((e1, e2) => filenameSorter(e1.name, e2.name));
                    });
                  });
                }
              } catch (error) {
                message.error(error.message);
                throw error;
              } finally {
                setUploadLoading(false);
                return false;
              }
            }}
          >
            <Button type="primary" loading={uploadLoading}>
              智能裁剪视频
            </Button>
          </Upload>
        )}
        {current ? <Button onClick={() => setCurrent(current - 1)}>上一步</Button> : null}
        <Button
          type="primary"
          loading={loading}
          disabled={steps[current].nextDisabled}
          onClick={steps[current].nextClick || (() => setCurrent(current + 1))}
        >
          {current < steps.length - 1 ? '下一步' : '完成'}
        </Button>
      </Space>
    </div>
  );
};
