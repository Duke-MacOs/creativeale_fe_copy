import { createContext, Fragment, useContext, useEffect, useState } from 'react';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { BlockBase, BooleanBase, notImplemented, TreeModal } from '@editor/Editor/Property/cells';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { changeEditor, useProvideEvent, useScriptError } from '@editor/aStore';
import { DropdownRender } from './components/DropdownRender';
import { getEventGroup } from './getEventGroup';
import { arrayMoveMutable } from 'array-move';
import { IScriptData } from '@byted/riko';
import { Button, theme, Tooltip } from 'antd';
import { EVENTS } from '.';
import { css, cx } from 'emotion';
import { collectEvent, EventTypes } from '@editor/utils';
import { useStore } from 'react-redux';
import { useEventBus } from '@byted/hooks';
import { GuideTip } from '@editor/views';
import guide from './guide.png';
import { iconOfScript } from '@editor/utils/icons';
import { DeleteOne } from '@icon-park/react';

const ScriptContext = createContext<{
  selected: number;
  checking?: boolean;
  enabled?: boolean;
  checked?: boolean;
  desc?: string;
  setSelected: (scriptId: number) => void;
  context?: 'useEvent' | 'Script';
}>({
  selected: 0,
  setSelected: notImplemented,
});

const getTitle = (script: RikoScript, color: string) => (
  <div style={{ display: 'flex', alignItems: 'center', columnGap: 4 }}>
    <Icon className={css({ color, fontSize: 16, 'svg *': { strokeWidth: 3 } })} component={iconOfScript(script)} />
    <span> {script.type === 'Effect' ? '动画效果' : script.props.name}</span>
  </div>
);

export interface EventListProps {
  scripts?: IScriptData[];
  checking?: boolean;
  enabled?: boolean;
  checked?: boolean;
  onChange: (scripts: IScriptData[], options?: any) => void;
  /**
   * 描述事件的触发时机
   */
  desc?: string;
  context?: 'useEvent' | 'Script';
}

export function EventList({ scripts = [], checking, enabled, checked, desc, onChange, context }: EventListProps) {
  const [selected, setSelected] = useState(0);

  const [dragged, setDragged] = useState(-1);

  useProvideEvent(selected, scripts, onChange);

  return (
    <ScriptContext.Provider value={{ selected, checking, enabled, checked, desc, setSelected, context }}>
      <List
        key={selected}
        distance={4}
        dragged={dragged}
        scripts={scripts}
        onChange={onChange}
        onSortStart={({ index }) => {
          setDragged(index);
        }}
        onSortEnd={({ oldIndex, newIndex }) => {
          const results: (IScriptData | number)[] = [];
          let target = null as any;
          const expand = (scripts: IScriptData[] = []) => {
            for (const script of scripts) {
              results.push(script);
              if (dragged === results.length - 1) {
                target = script;
                continue;
              }
              if (script.props.script === 'Conditions') {
                expand(script.props.scripts);
                results.push(1);
                expand(script.props.elseScripts);
              }
            }
            results.push(0);
          };
          expand(scripts);
          arrayMoveMutable(results, oldIndex, newIndex);
          const entries = results[Symbol.iterator]();
          const struct = (flag = -1) => {
            const scripts = [] as IScriptData[];
            for (const item of entries) {
              if (typeof item === 'number') {
                if (item === flag) {
                  return scripts;
                }
                continue;
              }
              if (item === target || item.props.script !== 'Conditions') {
                scripts.push(item);
                continue;
              }
              scripts.push({ ...item, props: { ...item.props, scripts: struct(1), elseScripts: struct(0) } });
            }
            return scripts;
          };
          onChange(struct());
          setDragged(-1);
        }}
      />
    </ScriptContext.Provider>
  );
}

const List = SortableContainer(({ scripts = [], dragged, onChange }: EventListProps & { dragged: number }) => {
  return (
    <div style={{ borderRadius: 4, overflow: 'hidden' }}>{Array.from(flatScripts(0, dragged, scripts, onChange))}</div>
  );
});

function* flatScripts(
  depth = 0,
  dragged: number,
  scripts: IScriptData[] = [],
  onChange: (scripts: IScriptData[], options?: any) => void,
  key = { current: 0 },
  last = true
): Generator<React.ReactNode> {
  for (const [index, script] of scripts.entries()) {
    const element = (
      <ItemContainer
        key={key.current}
        index={key.current++}
        depth={depth}
        children={
          <ScriptItem
            script={script}
            depth={depth}
            key={script.props.script}
            onChange={(script: any, options: any) => {
              const newScripts = scripts.slice();
              newScripts[index] = script;
              onChange(newScripts, options);
            }}
            onDelete={() => {
              onChange(scripts.filter((_, i) => i !== index));
            }}
          />
        }
      />
    );
    yield element;
    if (script.props.script === 'Conditions') {
      if (dragged === key.current - 1) {
        continue;
      }
      yield* flatScripts(
        depth + 1,
        dragged,
        script.props.scripts,
        (scripts_, options) => {
          const newScripts = scripts.slice();
          newScripts[index] = { ...script, props: { ...script.props, scripts: scripts_ } };
          onChange(newScripts, options);
        },
        key,
        false
      );
      yield (
        <ItemContainer
          disabled
          key={key.current}
          index={key.current++}
          depth={depth}
          children={
            <div
              className={css({
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: `0 ${depth === 0 ? 12 : 6}px`,
              })}
            >
              否则
            </div>
          }
        />
      );
      yield* flatScripts(
        depth + 1,
        dragged,
        script.props.elseScripts,
        (elseScripts, options) => {
          const newScripts = scripts.slice();
          newScripts[index] = { ...script, props: { ...script.props, elseScripts } };
          onChange(newScripts, options);
        },
        key
      );
    }
  }
  yield (
    <ItemContainer
      disabled
      key={key.current}
      index={key.current++}
      depth={depth}
      last={last}
      children={
        <ScriptAdd
          depth={depth}
          onAdd={(script: any) => {
            onChange(scripts.concat(script));
          }}
        />
      }
    />
  );
}

const ItemContainer = SortableElement(({ children, depth, last }: any) => {
  const { token } = theme.useToken();
  return (
    <div
      className={cx(
        css({
          background: token.colorBgLayout,
          height: 34,
          display: 'flex',
          ':not(:first-child)': {
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            height: 35,
          },
        })
      )}
    >
      {treeLines(depth, last, `1px solid ${token.colorBorderSecondary}`)}
      {children}
    </div>
  );
});

const treeLines = (depth: number, last: number, border: string) =>
  Array.from({ length: depth }).map((_, index) => {
    return index === depth - 1 ? (
      <Fragment key={index}>
        <div
          className={css({
            paddingLeft: 18,
            height: '100%',
            borderRight: last ? undefined : border,
          })}
        />
        <div
          className={css({
            paddingLeft: 6,
            height: '50%',
            borderLeft: last ? border : undefined,
            borderBottom: border,
          })}
        />
      </Fragment>
    ) : (
      <div key={index} className={css({ paddingLeft: 18, height: '100%', borderRight: border })} />
    );
  });

const ScriptItem = ({ script, onChange, onDelete, depth }: any) => {
  const { checking, enabled: openEnabled, selected, checked, setSelected } = useContext(ScriptContext);
  const { getState, dispatch } = useStore();
  const { trigger } = useEventBus('editorSender');
  useEffect(() => {
    if (selected === script.id) {
      const action = changeEditor(0, { openPanel: script.props.script });
      trigger(action);
      dispatch(action);
      return () => {
        const action = changeEditor(0, { openPanel: 'closePanel' });
        dispatch(action);
        trigger(action);
      };
    }
  }, [dispatch, getState, script.id, script.props.script, selected, trigger]);
  const event = EVENTS[(script.type === 'Effect' ? 'Effect' : script.props.script) as keyof typeof EVENTS];
  const { Summary } = event;
  const summary = useScriptError(script.props) || (Summary && <Summary {...(script as any)} />) || undefined;
  const { token } = theme.useToken();
  const buttonClass = css({ position: 'absolute', right: 8, opacity: 0 });
  const { enabled = true } = script.props;
  const content = (
    <>
      <div
        onClick={() => {
          setSelected(selected === script.id ? 0 : script.id);
        }}
        className={cx(
          css({
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            flex: 'auto',
            whiteSpace: 'nowrap',
            color: typeof summary === 'string' ? token.colorErrorText : undefined,
            overflow: 'hidden',
            padding: `0 ${depth === 0 ? 12 : 6}px`,
            position: 'relative',
            [`:hover .${buttonClass}`]: {
              opacity: 1,
              position: 'relative',
              right: -6,
            },
          }),
          script.id === selected && css({ background: 'rgb(238, 243, 254)' }),
          !enabled &&
            css({ filter: 'grayscale(1)', background: 'rgb(217, 217, 217)', [`.${buttonClass}`]: { opacity: 1 } })
        )}
      >
        {getTitle(script, token.colorPrimary)}
        <div className={css({ margin: '0 8px', width: 1, height: 20, background: 'rgb(235, 235, 235)' })} />
        <Tooltip title={summary}>
          <div
            className={css({
              flex: 'auto',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 12,
              opacity: 0.62,
            })}
          >
            {summary}
          </div>
        </Tooltip>
        <div className={buttonClass} onClick={event => event.stopPropagation()}>
          <BooleanBase
            type="enabled"
            size="small"
            value={enabled}
            onChange={enabled => {
              onChange({ ...script, props: { ...script.props, enabled } });
            }}
          />
          <Button type="text" size="small" icon={<DeleteOne />} onClick={onDelete} />
        </div>
      </div>
      {script.id === selected && (
        <TreeModal title={getTitle(script, token.colorPrimary)} onCancel={() => setSelected(0)}>
          {getEventGroup(script, onChange, checking)}
        </TreeModal>
      )}
    </>
  );
  return checking ? (
    <BlockBase
      topBottom={0}
      leftRight={0}
      checked={script.editor?.enabled ?? (checked && script.props.script !== 'CustomScript')}
      enabled={openEnabled && ['CustomScript', 'CopyText', 'PlaySound', 'PlayEffect'].includes(script.props.script)}
      setChecked={enabled => {
        onChange({ ...script, editor: { ...script.editor, enabled } }, { after: true });
      }}
      onClick={() => {
        setSelected(selected === script.id ? 0 : script.id);
      }}
    >
      {content}
    </BlockBase>
  ) : (
    content
  );
};

const ScriptAdd = ({ depth, onAdd }: any) => {
  const { desc, setSelected, context } = useContext(ScriptContext);
  return (
    <DropdownRender
      onSelect={(script: IScriptData) => {
        collectEvent(EventTypes.UserAddEventScript, {
          name: script.props.name!,
        });
        setSelected(script.id);
        onAdd(script);
      }}
      context={context}
    >
      <Button type="link" block style={{ textAlign: 'left', padding: `0 ${depth === 0 ? 12 : 6}px` }}>
        <GuideTip
          id="straight.playable.new.event1"
          head="响应事件增加了2个新功能"
          placement="leftTop"
          body={
            <div>
              <div>
                <strong>震动反馈：</strong>为你的互动素材提供更多可能性，增加更多有趣的效果！
                <br />
                <br />
                <strong>调起下载组件：</strong>用于互动结尾触发如图所示下载组件，整个素材至少有1个“调起下载组件”响应事件
              </div>
              <img src={guide} style={{ width: '100%', objectFit: 'contain', display: 'block', margin: '16px 0 0' }} />
            </div>
          }
        >
          <span>
            <PlusOutlined />{' '}
            {depth === 0 && (
              <>
                响应事件
                {desc && <Tooltip title={desc}>（查看触发时机）</Tooltip>}
              </>
            )}
          </span>
        </GuideTip>
      </Button>
    </DropdownRender>
  );
};
