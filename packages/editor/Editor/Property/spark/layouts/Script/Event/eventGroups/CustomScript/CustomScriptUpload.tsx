import {
  CodeSandboxOutlined,
  CopyOutlined,
  EditOutlined,
  FileAddOutlined,
  FolderOpenOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { addCustomScript, createScriptComponent, useEditor, useOnAddCustomScript, useProject } from '@editor/aStore';
import { ResourceChanger } from '../../../../groups/resourceSpark/ResourceBox/Actions';
import { CreateTabModal } from '@webIde/Sidebar/CreateTabModal';
import { EditorIdeUpdateStorageKey } from '@webIde/constant';
import { fromRikoHook, getCustomScriptByOrderId, getTopState, intoRikoHook, isRikoHook, RikoHook } from '@editor/utils';
import { Button, Col, Input, message, Upload } from 'antd';
import { isNumber, isString } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { openWebIde } from '@webIde/exports';
import { parseScript } from './parseScript';
import { useStore } from 'react-redux';
import Axios from 'axios';
import { css, cx } from 'emotion';
import { DeleteOne } from '@icon-park/react';

function useUpdated(interval = 2000) {
  const [timestamp, setTimestamp] = useState(
    Number(localStorage.getItem(EditorIdeUpdateStorageKey)) || new Date().getTime()
  );
  const ref = useRef(timestamp);
  ref.current = timestamp;
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function registerTimer() {
      timer = setTimeout(() => {
        const updateTimestamp = Number(localStorage.getItem(EditorIdeUpdateStorageKey));
        if (ref.current !== updateTimestamp) {
          setTimestamp(updateTimestamp);
          setUpdated(true);
        }
        registerTimer();
      }, interval);
    }

    registerTimer();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [interval]);

  return {
    updated,
    setUpdated,
  };
}

const styles = {
  box: css({
    display: 'flex',
    width: '100%',
  }),
  boxLeft: css({
    flex: '0 0 72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '72px',
    backgroundColor: '#F0F0F0',
  }),
  boxRight: css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '12px',
    backgroundColor: '#FAFAFA',
  }),
  readonlyTips: css({
    lineHeight: '32px',
    color: '#777',
    fontSize: '12px',
    borderRadius: '4px',
  }),
};

export function mergeCustomProps(
  oldProps: {
    [k: string]: RikoHook;
  },
  newProps: {
    [k: string]: RikoHook;
  }
) {
  return Object.fromEntries(
    Object.entries(newProps).map(([key, newConfig]) => {
      const oldConfig = oldProps[key];
      return [key, mergeRikoHook(oldConfig, newConfig)];
    })
  );
}

export function jsCodeToProps(props: RikoScript['props'], jsCode?: string, orderId?: number): RikoScript['props'] {
  const customProps = jsCode ? parseScript(jsCode, orderId) : {};
  const newProps = Object.fromEntries(
    Object.entries(customProps || {}).map(([key, config]) => {
      if (!isRikoHook(config)) {
        throw new Error(`不支持${config.callee}`);
      }
      return [`$${key}`, config];
    })
  );
  const { oldProps, rest } = Object.entries(props).reduce(
    (acc, [key, value]) => {
      if (key.startsWith('$')) {
        acc.oldProps[key] = value as RikoHook;
      } else {
        acc.rest[key] = value;
      }
      return acc;
    },
    {
      oldProps: {} as Record<string, RikoHook>,
      rest: {} as Record<string, any>,
    }
  );
  return {
    ...rest,
    ...mergeCustomProps(oldProps, newProps),
  } as any;
}

export function mergeRikoHook(oldHook: RikoHook, newHook: RikoHook): RikoHook {
  if (!oldHook) return newHook;
  if (!newHook) return oldHook;

  if (oldHook.callee !== newHook.callee) {
    return newHook;
  } else {
    switch (oldHook.callee) {
      case 'Riko.useObject':
      case 'object':
        return {
          ...newHook,
          value: Object.fromEntries(
            Object.entries(newHook.value || {}).map(([key, hook]: [string, any]) => [
              key,
              mergeRikoHook(oldHook.value[key], hook),
            ])
          ),
          _editor: oldHook._editor || {},
        };
      case 'Riko.useArray':
        return {
          ...newHook,
          value: oldHook.value.map((value: any, index: number) => {
            return fromRikoHook(
              mergeRikoHook(
                intoRikoHook(oldHook.defaultItem!, value),
                intoRikoHook(newHook.defaultItem!, newHook.value[index])
              )
            );
          }),
          _editor: oldHook._editor || {},
        };
      default: {
        return {
          ...newHook,
          value: oldHook.value,
          _editor: oldHook._editor || {},
        };
      }
    }
  }
}

export const CustomScriptUpload = ({ props, onChange }: any) => {
  const { dispatch, getState } = useStore<EditorState, EditorAction>();
  const { url, _editor: { name } = {} as any, _resName, jsCode, tsCode } = props;
  const { readOnly } = useEditor(0, 'readOnly');
  const projectId = useProject('id');

  const [changerVisible, setChangerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const onAddCustomScript = useOnAddCustomScript();

  const { updated, setUpdated } = useUpdated();
  useEffect(() => {
    setUpdated(true);
  }, [setUpdated, url]);
  useEffect(() => {
    try {
      const CancelToken = Axios.CancelToken;
      const source = CancelToken.source();
      if (updated) {
        if (props.url) {
          // 兼容老数据
          const isNewProject = getTopState(getState().project).settings.jsCode !== undefined;
          const newProps = isNewProject
            ? jsCodeToProps(props, getTopState(getState().project).settings.jsCode, props.url)
            : jsCodeToProps(props, getCustomScriptByOrderId(getState().project, props.url).jsCode);
          onChange(newProps);
          setUpdated(false);
        } else {
          onChange(jsCodeToProps(props));
          setUpdated(false);
        }
      }
      return () => {
        source.cancel();
      };
    } catch {}
  }, [getState, onChange, props, setUpdated, updated]);

  return (
    <Col>
      <div className={styles.box}>
        <div className={styles.boxLeft}>
          <CodeSandboxOutlined className={css({ fontSize: 32, color: '#999' })} />
        </div>
        <div className={styles.boxRight}>
          {url && (
            <Input
              className={css({ paddingLeft: 0, marginTop: 8 })}
              bordered={false}
              prefix={<EditOutlined />}
              value={(name || _resName)?.replace(/\.(ts|js)$/g, '')}
              onChange={e =>
                onChange({
                  ...props,
                  _editor: {
                    name: e.currentTarget.value,
                  },
                })
              }
            />
          )}
          {readOnly && isNumber(url) ? (
            <div>
              <Button
                className={cx(buttonClass, css({ width: 'auto !important' }))}
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  openWebIde(projectId, url);
                }}
              >
                查看
              </Button>
            </div>
          ) : readOnly || (!url && jsCode && tsCode) ? (
            <Button
              className={cx(buttonClass, css({ width: 'auto !important' }))}
              type="link"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(String(tsCode || jsCode)).then(
                  () => {
                    message.success('复制源码成功');
                  },
                  () => {
                    message.error('复制源码失败');
                  }
                );
              }}
            >
              复制源码
            </Button>
          ) : (
            <div className={css({ display: 'flex', columnGap: 8 })}>
              <Button
                className={cx(buttonClass, css({ width: 'auto !important' }))}
                type="link"
                icon={<FolderOpenOutlined />}
                onClick={() => setChangerVisible(true)}
              >
                选择
              </Button>
              <Upload
                accept=".ts,.js"
                multiple={false}
                showUploadList={false}
                beforeUpload={file => {
                  const reader = new FileReader();
                  reader.readAsText(file);
                  reader.onload = async () => {
                    const language: 'typescript' | 'javascript' =
                      file.type === 'text/javascript' ? 'javascript' : 'typescript';
                    if (isString(reader.result)) {
                      const script = {
                        type: 'CustomScript' as const,
                        jsCode: '',
                        ideCode: reader.result,
                        language,
                      };
                      const { id, orderId } = await createScriptComponent(projectId, file.name, script);
                      dispatch(addCustomScript({ id, orderId, name: file.name, ...script }));
                      setTimeout(() => {
                        openWebIde(projectId, orderId);
                      }, 300);
                    }
                  };
                  return false;
                }}
              >
                <Button
                  className={cx(buttonClass, css({ width: 'auto !important' }))}
                  type="link"
                  icon={<SwapOutlined />}
                >
                  上传
                </Button>
              </Upload>
              {url && typeof url === 'number' ? (
                <Button
                  className={cx(buttonClass, css({ width: 'auto !important' }))}
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    openWebIde(projectId, url);
                  }}
                >
                  编辑
                </Button>
              ) : (
                <Button
                  className={cx(buttonClass, css({ width: 'auto !important' }))}
                  type="link"
                  icon={<FileAddOutlined />}
                  onClick={async () => {
                    setCreateModalVisible(true);
                  }}
                >
                  创建
                </Button>
              )}

              {url && (
                <Button
                  className={cx(buttonClass, css({ width: 'auto !important' }))}
                  style={{ color: '#f65656' }}
                  type="link"
                  icon={<DeleteOne className={css({ lineHeight: 0, '+ span': { marginLeft: 4 } })} />}
                  onClick={() =>
                    onChange({
                      name: props.name,
                      script: props.script,
                      url: null,
                    })
                  }
                >
                  删除
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {changerVisible && (
        <ResourceChanger
          eleType="CustomScript"
          title={url ? '更换脚本' : '选择脚本'}
          onChange={({ url, name }: { url: string; name: string }) => {
            onChange({
              ...props,
              url,
              _editor: {
                name,
              },
            });
            setChangerVisible(false);
          }}
          onClose={() => setChangerVisible(false)}
        />
      )}
      {createModalVisible && (
        <CreateTabModal
          onConfirm={async (name, language) => {
            const newName = name + (language === 'typescript' ? '.ts' : '.js');
            const { orderId, projectId } = await onAddCustomScript(newName, language as 'typescript' | 'javascript');
            onChange({
              ...props,
              url: orderId,
              _editor: {
                ...props._editor,
                name: newName,
              },
            });
            setCreateModalVisible(false);
            setTimeout(() => {
              openWebIde(projectId, orderId);
            }, 300);
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      )}
    </Col>
  );
};

const buttonClass = css({
  padding: 0,
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  '&.ant-btn > .anticon + span': {
    marginLeft: 4,
  },
});
