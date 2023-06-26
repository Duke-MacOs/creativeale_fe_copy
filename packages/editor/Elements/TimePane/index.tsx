/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Input, theme } from 'antd';
import { maxEndTime, useEditor, useEditorCount } from '@editor/aStore';
import { UploadArea, EmptyArea } from '../../Resource/upload';
import useNodes from './Content/hooks/useNodes';
import { useMovable } from '@editor/hooks';
import { SCALE } from '@editor/utils';
import Timeline from './Timeline';
import Content from './Content';
import Header from './Header';
import { css, cx } from 'emotion';
const className = {
  input: css({
    position: 'sticky' as any,
    left: '0',
    top: '0',
    zIndex: 2,
  }),
  container: css({
    flex: 'auto',
    display: 'grid',
    gridTemplateRows: '32px 1fr',
    overflow: 'auto',
  }),
};
export default function TimePane() {
  const { token } = theme.useToken();
  const { scale } = useEditor('scale');
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { count, onChangeCount } = useEditorCount();
  const { nodes, filtered, flattened } = useNodes(keyword);
  const endTime = useMemo(() => maxEndTime(nodes), [nodes]);
  const { accumulative, activate, activated } = useMovable(0, 240, {
    reserved: true,
  });
  useEffect(() => {
    if (containerRef.current) {
      const { LENGTH, OFF_HEAD, OFF_TAIL } = SCALE;
      const observer = new ResizeObserver(entries => {
        for (const { contentRect } of entries) {
          const minSpaceCount = (contentRect.width - 240 - accumulative) / LENGTH - OFF_HEAD - OFF_TAIL;
          onChangeCount(Math.ceil(endTime / scale), Math.ceil(minSpaceCount));
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [containerRef.current, scale, endTime, activated || accumulative]);
  return (
    <div
      ref={containerRef}
      className={className.container}
      style={{
        gridTemplateColumns: `${240 + accumulative}px 1fr`,
      }}
    >
      <Input
        className={cx(
          className.input,
          css({
            borderRadius: 0,
            background: token.colorBgLayout,
          })
        )}
        placeholder="搜索"
        onChange={({ target: { value } }) => {
          setKeyword(value);
        }}
      />
      <Timeline scale={scale} count={count} length={flattened.length} />
      {flattened.length ? (
        <React.Fragment>
          <Header nodes={flattened} resizing={activated} onReWidth={activate} />
          <Content scale={scale} count={count} nodes={filtered} length={flattened.length} />
        </React.Fragment>
      ) : nodes.length ? (
        <EmptyArea />
      ) : (
        <UploadArea />
      )}
    </div>
  );
}
