import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Modal, Button, Form, Input, Row, Col, Tooltip, Spin, Switch, Checkbox, Progress, message } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { css } from 'emotion';
import { createResource } from '@shared/api';
import { createMaterialByUrls } from '@shared/api/library';
import { createEntry } from '@shared/globals/localStore';
import { ResourceType } from '../accepted';
import { getFigmaProject, renderFigmaNode } from './figmaApi';
import { documentToDict, pickFrames, figmaFrameToZip } from './utils';
import { IFigmaState } from './types';
import { fromFiles } from '../UploadFiles/fromFiles';
import { useProject } from '@editor/aStore';
import { isNil } from 'lodash';
import { useInterval } from '@byted/hooks';

type onFinishParam = Unpack<ReturnType<NonNullable<Unpack<ReturnType<typeof fromFiles>>>>>;
interface IProps {
  onHide(): void;
  onFinish(param: onFinishParam[]): void;
}

const styles = {
  inputTooltipTrigger: css({
    lineHeight: '32px',
    color: '#999',
  }),
  byGroupTooltipTrigger: css({
    marginLeft: '2px',
    color: '#999',
  }),
  tokenTips: css({
    display: 'inline-block',
    width: '8%',
    textAlign: 'center',
  }),
  frameList: css({
    height: 400,
    overflow: 'auto',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#e8e8e8',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
  }),
  frameItem: css({
    display: 'inline-block',
    marginRight: '3%',
    marginBottom: '8px',
    width: '22%',
    cursor: 'pointer',
    '&:nth-child(4n+4)': {
      marginRight: 0,
    },
  }),
  frameContent: css({
    position: 'relative',
    paddingBottom: '100%',
    border: '1px solid #ebebeb',
    borderRadius: '4px',
    '&:hover': {
      borderColor: '#3955f6',
    },
    '&[data-active=true]': {
      borderColor: '#3955f6',
    },
  }),
  framePoster: css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }),
  checkbox: css({
    position: 'absolute',
    bottom: 4,
    right: 4,
    opacity: 1,
  }),
  frameName: css({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    lineHeight: '28px',
  }),
  progressBar: css({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '4px 24px',
    backgroundColor: '#e5e9ff',
  }),
  progressMask: css({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    '& .ant-progress-text': {
      color: '#fff',
    },
  }),
};

export const cachedToken = createEntry(
  'editor.figmaToken',
  value => value ?? '',
  value => value ?? '',
  true
);

export function ImportFigmaDialog({ onHide, onFinish }: IProps) {
  const [form] = Form.useForm();
  const projectId = useProject('id');
  const cachedUrl = useMemo(() => {
    return createEntry(
      `editor.${projectId}.figmaUrl`,
      value => value ?? '',
      value => value ?? '',
      true
    );
  }, [projectId]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [figmaState, setFigmaState] = useState<IFigmaState | null>(null);
  const [frameList, setFrameList] = useState<Array<IFigmaState['dict'][string] & { cover?: string }>>([]);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);
  const [progressDict, setProgressDict] = useState<Record<string, number>>({});
  const [importByGroup, setImportByGroup] = useState(true);
  const baseConfig = useRef({ url: cachedUrl.getValue(), fileKey: '', accessToken: cachedToken.getValue() });
  const progressMaxAni = useRef<Record<string, number>>({});
  const urlInputRef = useRef<any>(null);

  const { run: runProgress, cancel: cancelProgress } = useInterval(
    () => {
      setProgressDict(dict => {
        const next = { ...dict };
        for (const id in dict) {
          next[id] = Math.min(progressMaxAni.current[id], dict[id] + 1);
        }
        return next;
      });
    },
    500,
    false
  );

  const handleCancel = useCallback(() => {
    onHide();
  }, [onHide]);
  const handlePrev = useCallback(() => {
    setStep(step => step - 1);
  }, [setStep]);
  const handleFetchFigmaProject = useCallback(() => {
    form
      .validateFields()
      .then(async ({ url, accessToken }) => {
        setLoading(true);
        const match = url.match(/^(https:\/\/www.figma.com\/file\/)(\w*)\//);
        if (match && match.length === 3) {
          baseConfig.current = { url, fileKey: match[2], accessToken };
          try {
            const project = await getFigmaProject({ fileKey: match[2], accessToken });
            setFigmaState(documentToDict(project.name, project.document));
            setStep(step => step + 1);
            cachedToken.setValue(accessToken);
            cachedUrl.setValue(url);
          } catch (err) {
            message.error(err.message);
            setLoading(false);
          }
        } else {
          return Promise.reject(new Error('请输入正确的Figma项目地址'));
        }
      })
      .catch(err => {
        setLoading(false);
        if (err.message) {
          message.error(err.message);
        }
      });
  }, [form, cachedUrl]);
  const handleConfirm = useCallback(async () => {
    if (!figmaState) return;

    const frameIds = Object.keys(selection).filter(id => selection[id]);
    if (!frameIds.length) {
      message.error('请选择需要导入的Frame');
      return;
    }

    setSaving(true);
    const dataList: onFinishParam[] = [];
    const createTasks = [];

    setProgressDict(
      frameIds.reduce((dict, id) => {
        dict[id] = 0;
        progressMaxAni.current[id] = 0;
        return dict;
      }, {} as Record<string, number>)
    );
    runProgress();
    for (const frameId of frameIds) {
      const frameData = frameList.find(frame => frame.id === frameId);
      const figmaCover = frameData?.cover;
      const figmaName = frameData?.name;

      try {
        progressMaxAni.current[frameId] = 40;
        const zipFile = await figmaFrameToZip(frameId, importByGroup, figmaState, baseConfig.current);
        let coverUrl: string | undefined = undefined;
        setProgressDict(dict => ({ ...dict, [frameId]: 40 }));

        let beforeUpload: ReturnType<typeof createMaterialByUrls> = Promise.resolve({});
        if (figmaCover) {
          beforeUpload = createMaterialByUrls({ cover: { url: figmaCover, type: ResourceType['Sprite'] } }, true);
        }

        progressMaxAni.current[frameId] = 70;
        const task = beforeUpload
          .then(res => {
            coverUrl = res.cover.previewUrl;
            setProgressDict(dict => ({ ...dict, [frameId]: 70 }));
            progressMaxAni.current[frameId] = 100;

            return createResource({
              file: zipFile,
              type: ResourceType['PSD'],
              cover: coverUrl,
              projectId,
            });
          })
          .then(({ id, url, cover }) => {
            dataList.push({ id, url, cover, name: zipFile.name.split('.')[0], extra: {}, mime: 'PSD' as const });
            setProgressDict(dict => ({ ...dict, [frameId]: 100 }));
          });
        createTasks.push(task);
      } catch (err) {
        message.error(`${figmaName}导入出错：${err.message}`);
        progressMaxAni.current[frameId] = 0;
      }
    }
    setTimeout(cancelProgress, 3000);
    if (createTasks.length > 0) {
      Promise.all(createTasks).then(() => {
        message.success('导入成功');
        setSaving(false);
        onFinish(dataList);
      });
    } else {
      progressMaxAni.current = {};
      setProgressDict({});
      setSaving(false);
    }
  }, [selection, figmaState, importByGroup, projectId, frameList, onFinish, runProgress, cancelProgress]);

  const buttons = useMemo(() => {
    return [
      [
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleFetchFigmaProject}>
          获取项目信息
        </Button>,
      ],
      [
        <Button key="cancel" disabled={saving} onClick={handleCancel}>
          取消
        </Button>,
        <Button key="prev" disabled={saving} onClick={handlePrev}>
          上一步
        </Button>,
        <Button key="submit" type="primary" loading={saving} onClick={handleConfirm}>
          确认
        </Button>,
      ],
    ];
  }, [loading, saving, handleCancel, handleFetchFigmaProject, handlePrev, handleConfirm]);

  const selectedAll = useMemo(() => {
    const selectedList = Object.values(selection).filter(selected => selected);
    return frameList.length > 0 && selectedList.length === frameList.length;
  }, [frameList, selection]);

  useEffect(() => {
    if (figmaState) {
      const { fileKey, accessToken } = baseConfig.current;
      let frames = pickFrames(figmaState, 500, 500);

      if (frames.length > 20) {
        setStep(step => step - 1);
        setLoading(false);
        message.error('当前Figma项目Frame数量过多，请简化项目结构，保持项目不超过20个Frame');
        return;
      }

      renderFigmaNode({ fileKey, ids: frames.map(frame => frame.id).join(','), accessToken })
        .then(res => {
          const { images: covers } = res;
          frames = frames.map(frame => ({ ...frame, cover: covers[frame.id] ?? '' }));
          setLoading(false);
          setFrameList(frames);
        })
        .catch(err => {
          let msg = err.message;
          if (err.code === 'ECONNABORTED') {
            msg = 'Figma响应超时，请简化Figma项目结构，减少Frame数量';
            setStep(step => step - 1);
          }
          setLoading(false);
          message.error(msg);
        });
    }
  }, [figmaState]);

  return (
    <Modal
      title="导入Figma项目"
      open={true}
      footer={buttons[step]}
      bodyStyle={{ position: 'relative' }}
      onCancel={onHide}
    >
      {step === 0 && (
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 17 }} initialValues={baseConfig.current}>
          <Form.Item label="Figma项目地址">
            <Form.Item noStyle name="url" rules={[{ required: true, message: '请输入Figma项目地址' }]}>
              <Input
                ref={urlInputRef}
                placeholder="打开Figma项目，复制对应的访问地址"
                autoComplete="off"
                onFocus={() => {
                  setTimeout(() => {
                    // 需要一定的延迟
                    if (urlInputRef && urlInputRef.current) {
                      const input = urlInputRef.current.input;
                      input.setSelectionRange(0, input.value.length);
                    }
                  }, 150);
                }}
              />
            </Form.Item>
          </Form.Item>

          <Form.Item label="Figma用户Token">
            <Form.Item noStyle name="accessToken" rules={[{ required: true, message: '请输入Figma用户Token' }]}>
              <Input placeholder="请输入" autoComplete="off" style={{ width: '92%' }} />
            </Form.Item>
            <div className={styles.tokenTips}>
              <Tooltip
                title={
                  <div>
                    <div>1、登录Figma账号</div>
                    <div>2、进入Account Settings</div>
                    <div>3、下滑找到Personal access tokens</div>
                    <div>4、添加Token并复制</div>
                  </div>
                }
              >
                <QuestionCircleOutlined className={styles.inputTooltipTrigger} />
              </Tooltip>
            </div>
          </Form.Item>
        </Form>
      )}
      {step === 1 && (
        <>
          <Row align="middle" style={{ marginBottom: '12px' }}>
            <Col span={18}>请选择需要导入的Frame</Col>
            <Col span={4} style={{ textAlign: 'center' }}>
              按组导入
              <Tooltip
                title={<div>是否将组内图层合并成一个节点</div>}
                overlayInnerStyle={{ letterSpacing: 'pre-line' }}
              >
                <QuestionCircleOutlined className={styles.byGroupTooltipTrigger} />
              </Tooltip>
            </Col>
            <Col span={2} style={{ textAlign: 'center' }}>
              <Switch size="small" checked={importByGroup} onChange={checked => setImportByGroup(checked)} />
            </Col>
          </Row>
          <Spin size="large" spinning={loading}>
            <div className={styles.frameList}>
              {frameList.map(frame => {
                return (
                  <div key={frame.id} className={styles.frameItem}>
                    <div
                      className={styles.frameContent}
                      data-active={selection[frame.id] ?? false}
                      onClick={() => {
                        if (saving) return;
                        setSelection(selection => {
                          return { ...selection, [frame.id]: !selection[frame.id] };
                        });
                      }}
                    >
                      <img className={styles.framePoster} src={frame.cover} crossOrigin="anonymous" />
                      <Checkbox className={styles.checkbox} checked={selection[frame.id]} disabled={saving} />
                      {!isNil(progressDict[frame.id]) && (
                        <div className={styles.progressMask}>
                          <Progress type="circle" percent={progressDict[frame.id]} width={32} />
                        </div>
                      )}
                    </div>
                    <div className={styles.frameName}>{frame.name}</div>
                  </div>
                );
              })}
            </div>
          </Spin>
          {!saving && (
            <div className={styles.progressBar}>
              <Checkbox
                checked={selectedAll}
                onChange={() => {
                  const selection: Record<string, boolean> = {};
                  for (const frame of frameList) {
                    selection[frame.id] = !selectedAll;
                  }
                  setSelection(selection);
                }}
              >
                {selectedAll ? '取消' : ''}全选
              </Checkbox>
            </div>
          )}
        </>
      )}
      <Button
        type="link"
        style={{ position: 'absolute', left: '9px', bottom: '-42px' }}
        icon={<QuestionCircleOutlined />}
        onClick={() => window.open('https://bytedance.feishu.cn/docs/doccnFRhjF5iXbtCm95Dh1YULUf#')}
      >
        查看帮助文档
      </Button>
    </Modal>
  );
}
