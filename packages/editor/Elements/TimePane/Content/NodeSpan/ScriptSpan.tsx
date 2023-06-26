import React from 'react';
import { IScriptState, useProps, useScriptError, useSelected } from '@editor/aStore';
import { useMovement } from '../hooks/useMovement';
import { classnest, findById, getNodes, getScene, SCALE } from '@editor/utils';
import { IScriptData } from '@byted/riko';
import JumpingLine from './JumpingLine';
import Icon from '@ant-design/icons';
import { Button, theme } from 'antd';
import { css, cx } from 'emotion';
import { CNP } from '..';
import { useEventBus } from '@byted/hooks';
import { useStore } from 'react-redux';
import { iconOfScript, Icons } from '@editor/utils/icons';

interface Props {
  nodeSelected: boolean;
  movement: number;
  script: IScriptState;
  scale: number;
  onScriptContextMenu: React.MouseEventHandler<HTMLDivElement>;
  activate(event: React.MouseEvent, whenDeactivated?: (distance: number) => void): void;
}

const nameScripts = (scripts: IScriptData[]): string =>
  `(${scripts
    .map(({ props: { name, script, scripts = [] } }) =>
      script === 'Conditions' ? nameScripts(scripts as any) : (name as string)
    )
    .join(' ')})`;

export default function ScriptSpan({
  script: { id, type, name, time, enabled = true },
  nodeSelected,
  movement,
  scale,
  onScriptContextMenu,
  activate,
}: Props) {
  const offset = SCALE.ms2px(time, scale);
  const { scripts, onChange } = useProps(id, 'scripts', [] as IScriptData[]);
  const { selected, onSelect } = useSelected(id);
  const { accumulative, activated } = useMovement('Scripts', selected);
  const start = offset + movement + accumulative;
  const { trigger } = useEventBus('Blueprint');
  const { getState } = useStore<EditorState>();

  const jumpingLines = (
    onChange: (scripts: IScriptData[]) => void,
    events: IScriptData[] = [],
    nodes: React.ReactNode[] = []
  ): React.ReactNode[] =>
    events.reduce((nodes, { id, props }, index) => {
      if (props.script === 'GotoAndStop' || props.script === 'GotoAndPlay') {
        const propName = props.script === 'GotoAndStop' ? 'stopTime' : 'startTime';
        nodes.push(
          <JumpingLine
            key={id}
            start={start}
            selected={selected || activated}
            end={SCALE.ms2px((props[propName] as number) ?? 0, scale)}
            onChange={(value: number) => {
              onChange(
                events.map((event, eventIndex) =>
                  index !== eventIndex
                    ? event
                    : { ...event, props: { ...event.props, [propName]: SCALE.px2ms(value, scale) } }
                )
              );
            }}
          />
        );
      } else if (props.script === 'Conditions') {
        jumpingLines(
          scripts => {
            onChange(
              events.map((event, eventIndex) =>
                index !== eventIndex ? event : { ...event, props: { ...event.props, scripts } }
              )
            );
          },
          props.scripts as any[],
          nodes
        );
      }
      return nodes;
    }, nodes);
  return (
    <div
      title={`${name}${nameScripts(scripts)}`}
      className={classnest({
        [`${CNP}-script`]: {
          selected: selected || activated,
          disabled: !enabled,
        },
      })}
      style={{ transform: `translateX(${start}px)` }}
      onMouseDown={event => {
        if (event.button === 2) {
          onScriptContextMenu(event);
        } else {
          if (selected) {
            event.persist();
            activate(event, distance => {
              if (!distance) {
                onSelect(event);
              }
            });
          } else {
            onSelect(event);
            activate(event);
          }
        }
      }}
      onDoubleClick={() => {
        if (type === 'Blueprint') {
          const nodes = getNodes(getScene(getState().project));
          const [node] = findById(nodes, id, true);
          if (node) {
            const scene = getScene(getState().project);
            trigger({ type: scene.id === node.id ? 'Scene' : 'Node', id: node.id });
          }
        }
      }}
      data-script={String(id)}
    >
      <ScriptIcon type={type} id={id} scripts={scripts} />
      {(nodeSelected || selected || activated) && jumpingLines(onChange, scripts)}
    </div>
  );
}

export function ScriptIconById({ id }: { id: number }) {
  return <ScriptIcon id={id} scripts={useProps<IScriptData[]>(id, 'scripts', []).scripts} />;
}

function ScriptIcon({ type, id, scripts = [] }: { type?: IScriptData['type']; id: number; scripts: IScriptData[] }) {
  const { token } = theme.useToken();
  const error = useScriptError(id);
  const EventIcon =
    type === 'Blueprint'
      ? Icons['Blueprint']
      : scripts.map(script => iconOfScript(script) as any).reduce((icon1, icon2) => icon2 || icon1, Icons['default']);
  return (
    <Button
      size="small"
      type="text"
      icon={<Icon component={EventIcon as any} />}
      className={cx(
        css({
          pointerEvents: 'none',
          color: error ? token.colorErrorText : token.colorPrimaryText,
          padding: 0,
        })
      )}
    />
  );
}
