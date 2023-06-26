import { ICustomScriptRow } from '@editor/Editor/History/hooks';
import { createModel, getModel } from '@webIde/Ide/monacoUtils';
import { switchHistory, useTab } from '@webIde/store';
import { useState, useEffect, useRef } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { IdeState } from '..';
import {
  getScriptHistoriesByTabId,
  getScriptHistoryById,
  changeScriptHistoryName,
  deleteScriptHistory,
  deleteFileHistory,
  lockScriptHistory,
} from './indexDB';
import { Button, Input, InputRef, message, Modal, Collapse, Tooltip } from 'antd';
import dayjs from 'dayjs';
import zhCN from 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Delete, Link, Clear, Pin } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { useEventBus } from '@byted/hooks';
import { css } from 'emotion';
import { monaco } from 'react-monaco-editor';
import { useHistoryCommon } from './hooks';
import useScriptTag from '@webIde/Sidebar/hooks/useScriptTag';
dayjs.extend(relativeTime);

export const AutoCreateHistoryIntervalTime = 20 * 1000;

interface IInputName {
  item: ICustomScriptRow;
  onUpdate: () => void;
}

interface IContainer extends IInputName {
  selectedHistoryId: number | null;
  onPin: () => void;
  onApply: () => void;
  onDelete: () => void;
  onSelectHistory: () => void;
}

export const styles = {
  listContainer: css({
    height: '300px',
    overflowY: 'scroll',
    color: 'white',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  collapse: css({
    backgroundColor: '#1e1f1c',
    '.ant-collapse-header': {
      color: 'white !important',
    },
    '.ant-collapse-content-box': {
      padding: '4px',
    },
  }),
};

const InputName = ({ item, onUpdate }: IInputName) => {
  const [name, setName] = useState(item.name);
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<InputRef>(null);
  return (
    <div
      style={{ display: 'inline-block', width: '35%' }}
      onDoubleClick={e => {
        e.stopPropagation();
        setEdit(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 200);
      }}
    >
      <Input
        ref={inputRef}
        size="small"
        value={name}
        bordered={edit}
        disabled={!edit}
        onClick={e => e.preventDefault()}
        onChange={e => {
          setName(e.target.value);
        }}
        onBlur={async () => {
          setEdit(false);
          await changeScriptHistoryName(item.historyId, name);
          onUpdate();
        }}
        onPressEnter={() => {
          inputRef.current?.blur();
        }}
      />
    </div>
  );
};

const Container = ({ selectedHistoryId, item, onPin, onSelectHistory, onApply, onDelete, onUpdate }: IContainer) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <div
      style={{
        margin: '5px',
        padding: '0 4px',
        background: selectedHistoryId === item.historyId ? '#404238' : isHover ? 'gray' : 'unset',
        color: selectedHistoryId === item.historyId ? '#8496fb' : 'white',
      }}
      onClick={onSelectHistory}
      onMouseOver={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
    >
      <span style={{ display: 'inline-block', width: '75px', userSelect: 'none' }}>
        {dayjs(new Date(item.createTime)).locale(zhCN).fromNow()}
      </span>{' '}
      <InputName item={item} onUpdate={onUpdate} />
      {(isHover || item.isLocked) && (
        <Tooltip title="置顶">
          <Button
            type="text"
            size={'small'}
            style={{ float: 'right', color: item.isLocked ? '#8496fb' : 'white' }}
            icon={<Icon component={Pin as any} />}
            onClick={e => {
              e.stopPropagation();
              onPin();
            }}
          />
        </Tooltip>
      )}
      {isHover && (
        <Tooltip title="删除">
          <Button
            type="text"
            size={'small'}
            style={{ float: 'right', color: 'white', visibility: isHover ? 'unset' : 'hidden' }}
            icon={<Icon component={Delete as any} />}
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </Tooltip>
      )}
      {isHover && (
        <Tooltip title="覆盖">
          <Button
            type="text"
            size={'small'}
            style={{ float: 'right', color: 'white', visibility: isHover ? 'unset' : 'hidden' }}
            icon={<Icon component={Link as any} />}
            onClick={e => {
              e.stopPropagation();
              onApply();
            }}
          />
        </Tooltip>
      )}
    </div>
  );
};

export const ExtraComponent = () => {
  const { onApply: onApplyTag } = useScriptTag();
  const { onApply, onCloseCompare } = useHistoryCommon();
  const { selectedHistoryId, selectedTag } = useSelector((state: IdeState) => {
    const { workspace } = state.ide;
    return {
      selectedTag: workspace.selectedTag,
      selectedHistoryId: workspace.selectedHistoryId,
    };
  }, shallowEqual);
  return (
    <div style={{ position: 'absolute', top: `2px`, right: '50px', zIndex: 2 }}>
      <Button
        style={{
          marginRight: '5px',
        }}
        size="small"
        type="primary"
        onClick={() => {
          if (selectedHistoryId) {
            onApply(selectedHistoryId);
          } else if (selectedTag) {
            onApplyTag(selectedTag);
          }
        }}
      >
        覆盖
      </Button>
      <Button size="small" onClick={onCloseCompare}>
        关闭
      </Button>
    </div>
  );
};

export default function ({
  createDiffEditor,
}: {
  createDiffEditor: (source: monaco.editor.ITextModel, target: monaco.editor.ITextModel) => void;
}) {
  const { dispatch } = useStore();
  const [update, setUpdate] = useState<number>(0);
  const [list, setList] = useState<ICustomScriptRow[]>([]);
  const { currentTab, selectedHistoryId } = useSelector((state: IdeState) => {
    const { workspace } = state.ide;
    return {
      currentTab: workspace.currentTab,
      selectedHistoryId: workspace.selectedHistoryId,
    };
  }, shallowEqual);
  const { tab } = useTab(currentTab, true);
  const { onApply } = useHistoryCommon();

  useEffect(() => {
    if (selectedHistoryId) {
      getScriptHistoryById(selectedHistoryId).then(history => {
        if (history?.id !== currentTab || currentTab === undefined) {
          dispatch(switchHistory(null));
          forceUpdate();
        }
      });
    }
  }, [currentTab, selectedHistoryId, dispatch]);

  const forceUpdate = () => {
    setUpdate(f => f + 1);
  };

  useEventBus('historyReload', forceUpdate);

  useEffect(() => {
    if (currentTab) {
      getScriptHistoriesByTabId(currentTab).then(list => {
        list && setList(list.reverse().sort(i => (i.isLocked ? -1 : 1)));
      });
    } else {
      setList([]);
    }
  }, [currentTab, update]);

  const onSelectHistory = (historyId: number) => {
    getScriptHistoryById(historyId).then(history => {
      dispatch(switchHistory(historyId));
      if (tab && history && history.historyId && history.resourceContent && history.resourceLanguage) {
        const source = getModel(tab.name);
        const target = createModel(history.historyId.toString(), history.resourceContent, history.resourceLanguage);
        if (source && target) {
          createDiffEditor(source, target);
        }
      }
    });
  };

  const onDelete = async (historyId: number) => {
    await deleteScriptHistory(historyId);
    forceUpdate();
    if (selectedHistoryId === historyId) {
      dispatch(switchHistory(null));
    }
  };

  const onDeleteFileHistory = async (e: any) => {
    e.stopPropagation();
    if (tab) {
      Modal.confirm({
        title: '删除',
        content: (
          <p>
            确定要删除<span style={{ color: 'orange' }}>{tab.name}</span>的所有非置顶历史记录吗？
          </p>
        ),
        onOk: async () => {
          tab && (await deleteFileHistory(tab.id));
          dispatch(switchHistory(null));
          forceUpdate();
        },
      });
    } else {
      message.error('文件不存在');
    }
  };

  const onPin = (historyId: number, lock: boolean) => {
    lockScriptHistory(historyId, lock);
    forceUpdate();
  };

  const CollapseHeader = (
    <>
      <span style={{ marginRight: '5px' }}>历史记录</span>
      <Button
        style={{ color: 'white' }}
        type="text"
        size={'small'}
        icon={<Icon component={Clear as any} />}
        onClick={onDeleteFileHistory}
      />
    </>
  );

  return (
    <div style={{ color: 'white' }}>
      <Collapse defaultActiveKey={['1']} bordered={false} className={styles.collapse}>
        <Collapse.Panel header={CollapseHeader} key="1">
          <div className={styles.listContainer}>
            {list.map((item, idx) => {
              return (
                <Container
                  key={item.historyId ?? idx}
                  item={item}
                  selectedHistoryId={selectedHistoryId}
                  onUpdate={forceUpdate}
                  onPin={() => {
                    item.historyId && onPin(item.historyId, !item.isLocked);
                  }}
                  onApply={() => {
                    item.historyId && onApply(item.historyId);
                  }}
                  onDelete={() => {
                    item.historyId && onDelete(item.historyId);
                  }}
                  onSelectHistory={() => {
                    item.historyId && onSelectHistory(item.historyId);
                  }}
                />
              );
            })}
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}
