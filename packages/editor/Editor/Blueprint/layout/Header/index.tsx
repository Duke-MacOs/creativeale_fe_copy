import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEventBus } from '@byted/hooks';
import { setSettings, useBlueprintHotkeys } from '@editor/aStore';
import SceneModeSelect from '@editor/Editor/Header/views/SceneModeSelect';
import { getTopState, onMacOS } from '@editor/utils';
import { Button, Space, Switch, Tooltip } from 'antd';
import { css } from 'emotion';
import { memo } from 'react';
import { useStore } from 'react-redux';
import { useBPContext, useCodeStatus } from '../../hooks';
import { compileAllToOne } from '../../utils';
import { useSidebar } from '../common';

export const containerId = 'blueprint-header-container';
export const Header = memo(() => {
  const { getState, dispatch } = useStore<EditorState>();
  const { save, init, state } = useBPContext()!;

  const { status, setStatus } = useCodeStatus();
  const isCodeMode = status.type !== 'hidden';

  async function closeBlueprint() {
    save();
    init(null);
    if (status.type !== 'writeOnly') {
      setStatus({ type: 'hidden' });
    }
    const customScripts = getTopState(getState().project).customScripts;
    if (customScripts.length) {
      const jsCode = await compileAllToOne(customScripts);
      dispatch(
        setSettings(
          {
            jsCode,
          },
          true
        )
      );
    }
  }

  useEventBus('closeBlueprint', closeBlueprint);

  useBlueprintHotkeys(`${onMacOS('command', 'control')}+shift+o`, () => {
    closeBlueprint();
  });

  const { visible, toggle } = useSidebar();
  return (
    <header
      className={css({
        position: 'relative',
        flex: '0 0 60px',
        display: 'flex',
        borderBottom: '1px solid #ccc',
        alignItems: 'center',
        padding: '0 20px',
      })}
    >
      {isCodeMode ? (
        <Space>
          <Switch checkedChildren="全屏代码开启" unCheckedChildren="全屏代码关闭" checked={!visible} onClick={toggle} />
          <div id={containerId} />
        </Space>
      ) : (
        state?.type !== 'Scene' && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => {
              const id = getState().project.editor.selectedSceneId;
              if (id) {
                save();
                init({ type: 'Scene', id });
              }
            }}
          >
            场景蓝图
          </Button>
        )
      )}

      <SceneModeSelect
        options={[
          { label: '项目模式', value: 'Project' },
          { label: '模板模式', value: 'Template' },
        ]}
      />
      <Space className={css({ marginLeft: 'auto' })}>
        {isCodeMode && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={async () => {
              setStatus({ type: 'hidden' });
              const customScripts = getTopState(getState().project).customScripts;
              if (customScripts.length) {
                const jsCode = await compileAllToOne(customScripts);
                dispatch(
                  setSettings(
                    {
                      jsCode,
                    },
                    true
                  )
                );
              }
            }}
          >
            返回蓝图
          </Button>
        )}
        <Tooltip title="(⇧+⌘+o)">
          <Button type="primary" onClick={closeBlueprint}>
            返回项目
          </Button>
        </Tooltip>
      </Space>
    </header>
  );
});
