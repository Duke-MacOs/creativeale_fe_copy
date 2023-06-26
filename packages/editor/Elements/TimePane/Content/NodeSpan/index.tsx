import React, { memo, useState } from 'react';
import { INodeState, IScriptState, useEditor, useSelected, useSettings } from '@editor/aStore';
import { classnest } from '@editor/utils';
import useOnContextMenu from '../hooks/useOnContextMenu';
import useScriptGroups from '../hooks/useScriptGroups';
import { useSetReflines } from '../hooks/useReflines';
import { useMoveScripts, useMoveScriptsAround } from '../hooks/useMoveScripts';
import useMoveNodes from '../hooks/useMoveNodes';
import OverlapPopup from './OverlapPopup';
import EffectSpan from './EffectSpan';
import ScriptSpan from './ScriptSpan';
import { CNP } from '..';

export interface NodeSpanProps {
  Overlay: React.FC<{
    left: number;
    top: number;
    scale: number;
    script?: IScriptState;
    hideOverlay: () => void;
  }>;
  movement?: number;
  scale: number;
  count: number;
  node: INodeState;
}
const NodeSpan = memo(({ node, scale, count, Overlay, movement = 0 }: NodeSpanProps) => {
  const setReflines = useSetReflines();
  const activate = useMoveScripts(setReflines);
  const activateLeft = useMoveScriptsAround('LeftOfScripts');
  const activateRight = useMoveScriptsAround('RightOfScripts');
  const { scriptGroups, edges } = useScriptGroups(node, scale, count);
  const { onScriptContextMenu, onContextMenu, onSelect, selected, overlay } = useOnContextMenu(node, scale, Overlay);
  const { nodeMovement, passMovement, onMoveNode } = useMoveNodes(selected, edges, setReflines);
  const {
    selected: { scriptIds },
    onSelectId,
  } = useSelected(0);
  const [backgroundColor, setBackgroundColor] = useState<string>();

  const { edit3d } = useEditor('edit3d');
  const typeOfPlay = useSettings('typeOfPlay');

  return (
    <React.Fragment>
      <div
        key={node.id}
        ref={current => {
          if (current) {
            const value = getComputedStyle(current).backgroundColor;
            setBackgroundColor(value);
          }
        }}
        className={classnest({
          [`${CNP}-item`]: {
            disabled: !(node.enabled ?? true),
            selected,
          },
        })}
        onMouseDown={event => {
          if (event.button === 2) {
            onContextMenu(event);
          } else if (selected) {
            event.persist();
            onMoveNode(event, distance => {
              if (!distance) {
                onSelect(event);
              }
            });
          } else {
            onSelect(event);
            onMoveNode(event);
          }
        }}
      >
        {scriptGroups.length
          ? scriptGroups.map((scripts, index) => {
              return (
                <React.Fragment key={index}>
                  {scripts.map(script =>
                    script.type === 'Script' || script.type === 'Blueprint' ? (
                      <ScriptSpan
                        key={script.id}
                        scale={scale}
                        script={script}
                        nodeSelected={selected}
                        movement={movement + nodeMovement}
                        onScriptContextMenu={onScriptContextMenu}
                        activate={activate}
                      />
                    ) : (
                      <EffectSpan
                        key={script.id}
                        scale={scale}
                        script={script}
                        binDisabled={
                          (script.type === 'Controller' &&
                            (['Animation', 'Sound', 'Video', 'VRSound', 'VRVideo'] as (typeof node.type)[]).includes(
                              node.type
                            )) ||
                          Boolean(script.intervalId)
                        }
                        movement={movement + nodeMovement}
                        onScriptContextMenu={onScriptContextMenu}
                        activate={activate}
                        activateLeft={activateLeft}
                        activateRight={activateRight}
                      />
                    )
                  )}
                  <OverlapPopup
                    scriptIds={scriptIds}
                    onSelectId={onSelectId}
                    scripts={scripts.filter(({ id }) => id > 0)}
                    scale={scale}
                    activate={activate}
                    backgroundColor={backgroundColor}
                    nodeMovement={nodeMovement + movement}
                  />
                </React.Fragment>
              );
            })
          : typeOfPlay !== 4 && <span className={`${CNP}-item-tips`}>在时间轴上右击可添加动画、事件</span>}
        {overlay}
      </div>
      {!node.editor?.isCollapsed &&
        (node.type !== 'Scene3D' || (node.type === 'Scene3D' && edit3d)) &&
        node.nodes
          .slice()
          .reverse()
          .map(node => (
            <NodeSpan
              key={node.id}
              node={node}
              scale={scale}
              count={count}
              Overlay={Overlay}
              movement={movement + passMovement}
            />
          ))}
    </React.Fragment>
  );
});

export default NodeSpan;
