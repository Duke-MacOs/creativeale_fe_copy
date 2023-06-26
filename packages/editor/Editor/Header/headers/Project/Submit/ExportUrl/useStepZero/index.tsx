import { StepHookReturn } from '../../SyncProduct/SyncDialog/StepDialog';
import { PreviewerContent } from '../../../Preview/PreviewerContent';
import { checkDirectDownloadScript, INodeState } from '@editor/aStore';
import { StepHeader } from '../../SyncProduct/SyncDialog';
import { CheckCircleFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { Phone, SettingTwo } from '@icon-park/react';
import { usePreviewUrl } from '../../../Preview';
import { cleanProject } from '@editor/utils';
import { useEffect, useState } from 'react';
import { Typography, Checkbox, Tooltip } from 'antd';
import { useHasFeature } from '@shared/userInfo';
import { useEventBus } from '@byted/hooks';
import { useStore } from 'react-redux';
import { uniqBy } from 'lodash';
import { css } from 'emotion';
import { amIHere } from '@shared/utils';

export default (): StepHookReturn => {
  const { getState } = useStore<EditorState>();
  const { previewUrl, updatePreviewUrl } = usePreviewUrl(getState);
  const [exportAsLynx, setExportAsLynx] = useState(false);
  const inhouseOnly = useHasFeature();
  const [replayKey, setReplayKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<
    Array<{
      id: number;
      name: string;
      passed?: boolean;
    }>
  >([]);

  useEffect(() => {
    updatePreviewUrl().then(() => setLoading(false));
    setNodes(uniqBy(checkDirectDownloadScript(cleanProject(getState().project)), 'id'));
  }, []);
  const { trigger } = useEventBus('ExportSettings');
  useEffect(() => {
    trigger({ exportAsLynx });
  }, [exportAsLynx, trigger]);
  const passed = nodes.some(({ passed }) => passed);

  return {
    title: '前置试玩校验',
    okDisabled: !passed && amIHere({ release: true }) && !inhouseOnly,
    cancelDisabled: false,
    spinning: loading,
    element: (
      <div className={css({ display: 'flex' })}>
        <div className={css({ flex: 'none' })}>
          <StepHeader title="试玩区" Icon={Phone} />
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <div
              className={css({
                padding: 8,
                borderRadius: 8,
                // background: 'white',
                margin: '0 20px',
                boxShadow: '-4px 0px 16px rgba(0, 0, 0, 0.06), inset 1px 0px 4px rgba(0, 0, 0, 0.12)',
              })}
            >
              {!loading && (
                <PreviewerContent
                  mask12
                  width={172}
                  height={374}
                  key={replayKey}
                  onReplay={() => setReplayKey(key => key + 1)}
                  httpUrl={previewUrl + '&previewMode=true'}
                  onEventTracked={event => {
                    if (event.eventName === 'playableEnd') {
                      console.log(event, nodes);
                      setNodes(nodes =>
                        nodes.map(node => {
                          if (node.passed || node.id !== event.params.areaId) {
                            return node;
                          }
                          return { ...node, passed: true };
                        })
                      );
                    }
                  }}
                />
              )}
            </div>
            <div className={css({ width: 1, height: 360, background: '#EBEBEB', margin: '0 36px 0 16px' })} />
          </div>
        </div>
        <div className={css({ flex: 'auto' })}>
          <StepHeader title="前置校验结果（必要步骤）" Icon={SettingTwo} />
          <div className={css({ marginLeft: 20 })}>
            <Typography.Text type="secondary">• 试玩过程中是否能正常触发一次【调起下载组件】</Typography.Text>
            <div
              className={css({
                background: '#FAFAFA',
                overflow: 'auto',
                borderRadius: 4,
                margin: '16px 0',
                padding: 12,
                height: 200,
                width: 500,
              })}
            >
              {nodes.map(({ id, name, passed }) => {
                const type = passed ? 'success' : 'secondary';
                return (
                  <div
                    key={id}
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      lineHeight: '28px',
                      columnGap: 12,
                      whiteSpace: 'nowrap',
                    })}
                  >
                    <Typography.Text type={type} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}元素触发【调起下载组件】事件
                    </Typography.Text>
                    <Typography.Text type={type}>{passed ? '通过' : '未玩到'}</Typography.Text>
                  </div>
                );
              })}
            </div>
            <div>
              {passed && (
                <Typography.Text type="success" style={{ marginRight: 16 }}>
                  <CheckCircleFilled /> 前置校验通过
                </Typography.Text>
              )}
              {amIHere({ release: false }) && (
                <>
                  <Checkbox
                    checked={exportAsLynx}
                    onChange={({ target: { checked } }) => {
                      setExportAsLynx(checked);
                    }}
                  >
                    导出为Lynx
                  </Checkbox>
                  <Tooltip title="Lynx导出说明">
                    <QuestionCircleOutlined
                      className={css({ cursor: 'pointer' })}
                      onClick={() => {
                        window.open('https://bytedance.feishu.cn/docx/YgUFdXkQJoJ6nPx8Xwbc6b4Vnwf');
                      }}
                    />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    async mapValues() {
      if (exportAsLynx) {
        const { project } = getState();
        for (const scene of project.scenes.filter(scene => scene.type === 'Scene')) {
          const nodes = Array.from(
            collectNodes(scene.nodes, function* (node) {
              if (node.type === 'Lottie') {
                yield node;
              }
            })
          );

          if (nodes.length) {
            throw new Error('导出为Lynx暂不支持Lottie节点');
          }
        }
      }
      return {};

      function* collectNodes(nodes: INodeState[], map: (node: INodeState) => Generator<any>): Generator<any> {
        for (const node of nodes) {
          yield* map(node);
          if (node.nodes) {
            yield* collectNodes(node.nodes, map);
          }
        }
      }
    },
  };
};
