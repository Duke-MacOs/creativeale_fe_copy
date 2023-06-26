import { useDebounceFn } from '@byted/hooks';
import { setSettings, useOnSaveCustomScript } from '@editor/aStore';
import { RikoDiffEditor } from '@editor/Editor/Blueprint/components/RikoDiffEditor';
import { ICustomScriptRow } from '@editor/Editor/History/hooks';
import { jsCodeToProps } from '@editor/Editor/Property/spark/layouts/Script/Event/eventGroups/CustomScript/CustomScriptUpload';
import { getCustomScriptByOrderId, getTopState } from '@editor/utils';
import { addScriptHistory } from '@webIde/History/indexDB';
import { Button, Space } from 'antd';
import { css, cx } from 'emotion';
import { useState, useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useStore } from 'react-redux';
import { RikoEditor } from '../../../components/RikoEditor';
import { useBPContext, useCodeEditor, useCodeStatus } from '../../../hooks';
import { compileAllToOne, isValidCode } from '../../../utils';
import { containerId } from '../../Header';
import { History } from './History';
import { useWindowInnerWidth } from '../../../hooks/utils/useWindowInnerWidth';

export const Ide = memo(function ({ theme }: { theme: 'light' | 'dark' }) {
  const props = useBPContext()!;
  const { selectedIds } = props;
  const { status } = useCodeStatus();
  const { script, onChange } = useCodeEditor(props);
  const width = useWindowInnerWidth();

  switch (status.type) {
    case 'hidden': {
      return null;
    }
    case 'readOnly': {
      return (
        <div className={cx(css({ display: 'flex', height: 'calc(100vh - 60px)' }), theme === 'dark' && darkMode)}>
          <RikoEditor
            theme={theme}
            width={selectedIds.length > 0 ? width - 320 : width}
            readOnly={true}
            value={status.tsCode}
            onChange={code => {
              throw new Error(code);
            }}
          />
        </div>
      );
    }
    case 'writeOnly':
    case 'selected': {
      if (status.type === 'selected' && (!script || script!.props.script !== 'CustomScript' || !script!.props.url)) {
        return null;
      }
      return (
        <LiveEditor
          maxWidth={props.selectedIds?.length ? width - 320 : width}
          key={status.type === 'writeOnly' ? status.url : script!.id}
          theme={theme}
          url={status.type === 'writeOnly' ? status.url : script!.props.url}
          onChangeProps={jsCode => {
            if (status.type === 'selected') {
              const newProps = jsCodeToProps(script!.props, jsCode, script!.props.url);
              onChange({ ...script, props: newProps }, { ids: [Number(selectedIds[0])] });
            }
          }}
        />
      );
    }

    default: {
      return null;
    }
  }
});

const LiveEditor = memo(
  ({
    url,
    onChangeProps,
    maxWidth,
    theme = 'light',
  }: {
    url: number;
    onChangeProps?: (jsCode: string) => void;
    maxWidth: number;
    theme?: 'light' | 'dark';
  }) => {
    const { getState, dispatch } = useStore<EditorState>();
    const onSave = useOnSaveCustomScript();
    const scene = useSelector(({ project }: EditorState) => getCustomScriptByOrderId(project, url));
    useEffect(() => {
      setCode(scene.ideCode);
      codeRef.current = scene.ideCode;
    }, [scene.ideCode]);
    const [code, setCode] = useState(scene.ideCode);
    const initCodeRef = useRef(code);
    const codeRef = useRef(code);
    /**
     * @docs
     * https://bytedance.feishu.cn/wiki/wikcnAsLeAv0T8bFOkHgh5AC3yc
     */
    const { run: compile, cancel: cancelCompile } = useDebounceFn(
      async () => {
        if (isValidCode(code)) {
          const customScripts = getTopState(getState().project).customScripts.map(script =>
            script.id === scene.id ? { ...script, ideCode: code } : script
          );
          if (customScripts.length) {
            const jsCode = await compileAllToOne(customScripts);
            onChangeProps?.(jsCode);
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
      },
      600,
      [code, scene]
    );

    const { run: saveLocally, cancel: cancelSaveLocally } = useDebounceFn(
      async () => {
        addScriptHistory({
          resourceContent: code,
          id: scene.id,
          orderId: scene.orderId,
          projectId: getState().project.id,
          name: scene.name,
          resourceLanguage: 'typescript',
          needsSave: true,
          saveStatus: 0,
        });
      },
      6000,
      [code, scene]
    );

    useEffect(() => {
      compile();
      saveLocally();
      return () => {
        cancelCompile();
        cancelSaveLocally();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    useEffect(() => {
      return () => {
        if (initCodeRef.current !== codeRef.current) {
          onSave(scene.id, scene.name, {
            ...scene,
            ideCode: codeRef.current,
            status: 0,
          });
        }
        compile();
        saveLocally();
      };
    }, []);

    const darkMode = css({
      filter: 'invert(1) hue-rotate(180deg)',
    });

    const [selectedHistory, setSelectedHistory] = useState<ICustomScriptRow | null>(null);
    const [historiesVisible, setHistoriesVisible] = useState(false);
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    useEffect(() => {
      const el = document.querySelector<HTMLDivElement>(`#${containerId}`);
      if (el) {
        setContainer(el);
      }
    }, []);

    const historyWidth = historiesVisible ? 140 : 0;

    return (
      <div className={cx(css({ display: 'flex', height: 'calc(100vh - 60px)' }), theme === 'dark' && darkMode)}>
        {historiesVisible && (
          <History
            id={scene.id}
            width={historyWidth}
            selectedHistory={selectedHistory}
            onSelectHistory={history => {
              setSelectedHistory(history);
            }}
          />
        )}
        {selectedHistory ? (
          <RikoDiffEditor
            virtualKey={url}
            key={url}
            theme={theme}
            width={maxWidth - historyWidth}
            original={selectedHistory.resourceContent!}
            modified={code}
          />
        ) : (
          <RikoEditor
            virtualKey={url}
            key={url}
            name={scene.name}
            theme={theme}
            width={maxWidth - historyWidth}
            value={code}
            onChange={code => {
              if (code) {
                codeRef.current = code;
                setCode(code);
              }
            }}
          />
        )}
        {container &&
          createPortal(
            <HeaderButtons
              historiesVisible={historiesVisible}
              setHistoriesVisible={setHistoriesVisible}
              selectedHistory={selectedHistory}
              setSelectedHistory={setSelectedHistory}
              onApply={history => {
                setCode(history.resourceContent!);
              }}
            />,
            container
          )}
      </div>
    );
  }
);

function HeaderButtons<T extends ICustomScriptRow>({
  historiesVisible,
  setHistoriesVisible,
  selectedHistory,
  setSelectedHistory,
  onApply,
}: {
  historiesVisible: boolean;
  setHistoriesVisible: React.Dispatch<React.SetStateAction<boolean>>;
  selectedHistory: T | null;
  setSelectedHistory: React.Dispatch<React.SetStateAction<T | null>>;
  onApply: (history: T) => void;
}) {
  return historiesVisible ? (
    <Space>
      <Button
        onClick={async () => {
          setHistoriesVisible(false);
          setSelectedHistory(null);
        }}
      >
        继续编辑
      </Button>
      {selectedHistory && (
        <Button
          type="primary"
          onClick={async () => {
            setHistoriesVisible(false);
            setSelectedHistory(null);
            setTimeout(() => {
              if (selectedHistory) {
                onApply(selectedHistory);
              }
            });
          }}
        >
          应用
        </Button>
      )}
    </Space>
  ) : (
    <Button
      onClick={async () => {
        setHistoriesVisible(true);
      }}
    >
      历史代码
    </Button>
  );
}
