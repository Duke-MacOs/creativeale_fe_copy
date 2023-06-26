import React from 'react';
import { SCALE } from '@editor/utils';
import NodeSpan, { NodeSpanProps } from './NodeSpan';
import useContextMenu from './hooks/useContextMenu';
import { useGetReflines } from './hooks/useReflines';
import './style.scss';

export const CNP = 'editor-timeline-scene-content';
export interface ContentProps
  extends Omit<NodeSpanProps, 'node' | 'getBins' | 'Overlay' | 'showRefLines' | 'onDeleteScript'> {
  nodes: Array<NodeSpanProps['node']>;
  length: number;
  scale: number;
}

export default function Content({ scale, count, nodes, length }: ContentProps) {
  const reflines = useGetReflines();
  const { Overlay, element } = useContextMenu();
  return (
    <div className={`${CNP}-main`}>
      {nodes
        .slice()
        .reverse()
        .map(node => (
          <NodeSpan key={node.id} node={node} scale={scale} count={count} Overlay={Overlay} />
        ))}
      <div style={{ position: 'absolute', left: 0, top: 0 }}>
        {reflines.map((refLine, index) => (
          <div
            key={index}
            style={{
              height: `${length * 32}px`,
              position: 'absolute',
              left: `${SCALE.OFF_HEAD * SCALE.LENGTH}px`,
              transform: `translateX(${refLine}px)`,
              transition: '200ms',
              top: '0',
              pointerEvents: 'none',
              borderLeft: '1px dashed #0dce8a',
              zIndex: 1,
            }}
          />
        ))}
      </div>
      {element}
    </div>
  );
}
