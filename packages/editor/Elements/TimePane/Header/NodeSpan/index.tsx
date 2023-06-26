import { memo, useEffect, useRef, useState } from 'react';
import {
  useOnChangeEditor,
  useOnDropNodes,
  useSelected,
  useOnAddNodeFromFiles,
  useOnAddScripts,
  useSettings,
} from '@editor/aStore';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { classnest, getScene, newID } from '@editor/utils';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from 'react-redux';
import { Button } from 'antd';
import useDidDrag from './useDidDrag';
import EditorOps from './EditorOps';
import NodeName from './NodeName';
import TypeIcon from './NodeIcon';
import { HeaderNode } from '..';
import { css } from 'emotion';
import { isEqual } from 'lodash';
export interface NodeSpanProps {
  resizing: boolean;
  node: HeaderNode;
}
export const CNP = 'editor-timeline-scene-header';

export type TreeNode = {
  key: number;
  title: HeaderNode;
  children: TreeNode[];
};
const NodeSpan = ({ node, resizing }: NodeSpanProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const onChangeEditor = useOnChangeEditor();
  const [hover, setHover] = useState<'inside' | 'before' | 'after' | ''>('');
  const [isEditing, setIsEditing] = useState(false);
  const { getState } = useStore<EditorState, EditorAction>();
  const onAddScripts = useOnAddScripts();
  const { onAddNode, onAddNodeFromFiles } = useOnAddNodeFromFiles();
  const { selected, onSelect, onSelectId } = useSelected(node.id, true);
  const { isDroppable, onDropNodes } = useOnDropNodes();
  const { beginDrag, didDrag } = useDidDrag();
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  const [{ isOver }, drop] = useDrop<
    | { type: 'node'; id: number }
    | { type: 'resource'; mime: string; name: string; url: string; cover?: string }
    | { type: 'undefined'; files: File[] },
    any,
    any
  >({
    accept: ['node', 'resource', NativeTypes.FILE],
    drop(item) {
      if (hover) {
        if (item.type === 'node') {
          onDropNodes(node.id, hover);
        } else if (item.type === 'resource') {
          if (item.mime === 'CustomScript') {
            onSelectId({}, [node.id], true);
            onAddScripts('Script', {
              script: 'Auto',
              name: '自动触发',
              once: true,
              time: getScene(getState().project).editor.moment,
              scripts: [
                {
                  id: newID(),
                  type: 'Script',
                  props: {
                    name: '自定义脚本',
                    script: 'CustomScript',
                    url: item.url,
                  },
                },
              ],
            });
          } else {
            onAddNode({
              ...item,
              targetId: node.id,
              dropWhere: hover,
            });
          }
        } else if (item.type === (undefined as unknown as 'undefined')) {
          onAddNodeFromFiles(item.files, { targetId: node.id, dropWhere: hover });
        }
      }
    },
    collect(monitor) {
      return { isOver: monitor.canDrop() && monitor.isOver() };
    },
    hover(item, monitor) {
      const hover = (() => {
        if (item.type === 'resource' && item.mime === 'CustomScript') {
          return 'inside';
        }
        const clientOffset = monitor.getClientOffset();
        if (!ref.current || !clientOffset) {
          return '';
        }
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;
        if (hoverClientY + 8 < hoverMiddleY) {
          return 'after';
        }
        if (hoverClientY > hoverMiddleY + 8) {
          return 'before';
        }
        return 'inside';
      })();
      if (hover && isDroppable(node.id, hover, item.type ?? 'undefined')) {
        setHover(hover);
        if (typeOfPlay === 4 && hover === 'inside') {
          setHover('');
        }
        if (typeOfPlay === 4 && node.type === 'PVVideo') {
          setHover('after');
        }
        if (isVRVideo && hover === 'inside') {
          setHover('');
        }
        if (isVRVideo && node.type === 'VRVideo') {
          setHover('after');
        }
      } else {
        setHover('');
      }
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'node', id: node.id },
    begin: beginDrag,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag() {
      if (typeOfPlay === 4 && node.type === 'PVVideo') {
        return false;
      }
      return !isEditing && selected;
    },
  });
  drag(drop(ref));

  useEffect(() => {
    if (selected) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      });
    }
  }, [selected]);

  return (
    <div
      key={node.id}
      ref={ref}
      className={classnest({
        [`${CNP}-item`]: {
          selected: selected || isDragging,
          disabled: !node.enabled,
          [hover]: isOver,
        },
      })}
      style={{
        paddingLeft: `${(node.depth - 1) * 20}px`,
      }}
      onDoubleClick={() => {
        if (isVRVideo && node.name === 'VR3D场景') {
          return;
        } else {
          setIsEditing(true);
          onSelect({});
        }
      }}
      onMouseDown={event => {
        if (event.button === 2) {
          if (!selected) {
            onSelect(event);
          }
          // mouseDown 事件会触发 Dropdown 菜单的 onOpenChange 函数且传入的 visible 为 false
          // 如果不包 setTimeout 的话会导致先出现菜单再触发 onOpenChange 导致菜单马上关闭
          setTimeout(() => onChangeEditor(0, { contextMenu: { x: -event.clientX, y: -event.clientY } }));
        } else if (selected) {
          event.persist();
          didDrag(didDrag => {
            if (!didDrag) {
              onSelect(event);
            }
          });
        } else {
          onSelect(event);
        }
      }}
    >
      {node.maskDepths.map(depth => (
        <div
          key={depth}
          style={{
            position: 'absolute',
            height: '100%',
            borderLeft: '0.1px solid #999',
            left: (depth - 1) * 20 + 9,
          }}
        />
      ))}
      {node.asMask && (
        <div
          style={{
            position: 'absolute',
            height: '50%',
            width: 10,
            borderLeft: '0.1px solid #999',
            borderBottom: '0.1px solid #999',
            top: 0,
            left: (node.depth - 1) * 20 + 9,
          }}
        />
      )}
      <Button
        type="text"
        size="small"
        className={classnest([
          css({
            color: '#999',
            flex: '0 0 20px',
            '& svg': {
              transform: 'scale(0.72)',
            },
            '&:hover': {
              opacity: '#333',
            },
          }),
          node.children === 0 &&
            css({
              visibility: 'hidden',
            }),
        ])}
        onMouseDown={event => {
          event.stopPropagation();
          onChangeEditor(node.id, { isCollapsed: !node.isCollapsed }, true);
        }}
        icon={node.isCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
      />
      <div style={{ flex: '0 0 20px', textAlign: 'center' }}>
        <TypeIcon type={node.type} asMask={node.asMask} />
      </div>
      {isEditing ? (
        <NodeName nodeId={node.id} setIsEditing={setIsEditing} />
      ) : (
        <div style={{ flex: 'auto', overflow: 'hidden' }}>
          {node.name || '未命名节点'}
          {node.visible ? '' : '（已隐藏）'}
        </div>
      )}
      {!isEditing && <EditorOps node={node} resizing={resizing} onChangeEditor={onChangeEditor} />}
    </div>
  );
};

export default memo(NodeSpan, isEqual);
