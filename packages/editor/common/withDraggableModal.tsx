import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import { HamburgerButton } from '@icon-park/react';
import { isNumber, isObject, isNil } from 'lodash';
import { usePersistCallback } from '@byted/hooks';
import { useDrag } from '@editor/hooks';
import { css, cx } from 'emotion';
import { theme } from 'antd';

const styles = {
  content: css({
    position: 'absolute',
    zIndex: 100,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '12px',
    boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08), 0 9px 28px 8px rgba(0,0,0,.05)',
  }),
  header: css({
    position: 'relative',
    padding: '16px',
    cursor: 'move',
  }),
  headerTitle: css({
    paddingRight: '16px',
    color: 'rgba(0, 0, 0, 0.85)',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '20px',
  }),
  headerClose: css({
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '16px',
    color: 'rgba(0, 0, 0, 0.45)',
    lineHeight: '20px',
    cursor: 'pointer',
  }),
  contentBody: css({
    position: 'relative',
    flex: 1,
  }),
  contentScrollBox: css({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'auto',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#e8e8e8',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
  }),
  resizeY: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '12px',
    borderTop: '1px solid #E8E8E8',
    textAlign: 'center',
    fontSize: '0 !important',
    verticalAlign: 'middle',
    cursor: 'ns-resize',

    '& .i-icon': {
      fontSize: '0 !important',
    },
  }),
};

export default function withDraggableModal<T>(
  Component: React.ComponentType<T>,
  title: string,
  width: number,
  compKey: string
) {
  return ({
    onClose,
    title: t,
    defaultPos,
    defaultHeight,
    ...props
  }: T & {
    title?: string;
    defaultPos?: { top?: number; left?: number; bottom?: number; right?: number };
    defaultHeight?: number;
    onClose: () => void;
  }) => {
    const [offset, setOffset] = useState({ top: 0, left: 0 });
    const [height, setHeight] = useState(defaultHeight || 500);
    const headerEleRef = useRef<HTMLDivElement | null>(null);
    const resizeEleRef = useRef<HTMLDivElement | null>(null);
    const clientSize = useRef({ w: document.documentElement.clientWidth, h: document.documentElement.clientHeight });
    const dragLogRef = useRef<Record<string, any>>({ offset, height });
    dragLogRef.current = { offset, height };

    const { isDragging: isHeaderDragging, calculatedState: modalTranslate } = useDrag(headerEleRef, {
      originData: {
        x: offset.left,
        y: offset.top,
      },
    });
    const { isDragging: isResizeBarDragging, calculatedState: modalSize } = useDrag(resizeEleRef, {
      originData: {
        y: height,
      },
    });

    const initPositionAndSize = usePersistCallback(() => {
      let cachePos: Record<string, unknown> | string | null = sessionStorage.getItem(
        'editor._draggingModalOffset.' + compKey
      );
      let cacheHeight: Record<string, unknown> | string | null = sessionStorage.getItem(
        'editor._draggingModalHeight.' + compKey
      );
      cacheHeight = cacheHeight ? JSON.parse(cacheHeight) : cacheHeight;

      const calcOffset: { top?: number; left?: number } = {};
      const conH =
        cacheHeight && isNumber(cacheHeight) && cacheHeight < clientSize.current.h ? cacheHeight : defaultHeight || 500;

      if (defaultPos) {
        if (!isNil(defaultPos.top)) {
          calcOffset.top = defaultPos.top;
        } else if (!isNil(defaultPos.bottom)) {
          calcOffset.top = clientSize.current.h - conH - defaultPos.bottom;
        }

        if (!isNil(defaultPos.left)) {
          calcOffset.left = defaultPos.left;
        } else if (!isNil(defaultPos.right)) {
          calcOffset.left = clientSize.current.w - width - defaultPos.right;
        }

        calcOffset.top = calcOffset.top ? Math.min(calcOffset.top, clientSize.current.h - conH) : calcOffset.top;
        calcOffset.left = calcOffset.left ? Math.min(calcOffset.left, clientSize.current.w - width) : calcOffset.left;
      }

      if (cachePos) {
        cachePos = JSON.parse(cachePos);
        if (isObject(cachePos) && isNumber(cachePos.top) && isNumber(cachePos.left)) {
          calcOffset.left = Math.min(cachePos.left, clientSize.current.w - width);
          calcOffset.top = Math.min(cachePos.top, clientSize.current.h - conH);
        }
      }

      setHeight(conH);
      dragLogRef.current.height = conH;

      setOffset(offset => {
        const latestOffset = { ...offset, ...calcOffset };
        dragLogRef.current.offset = latestOffset;
        return latestOffset;
      });
    });

    useLayoutEffect(() => {
      const handleResize = () => {
        clientSize.current = { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight };
        initPositionAndSize();
      };
      window.addEventListener('resize', handleResize);
      initPositionAndSize();

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [initPositionAndSize]);

    useLayoutEffect(() => {
      if (isHeaderDragging) {
        document.getElementsByTagName('html')[0].classList.add('global-dragging-cursor');
      }
      return () => {
        sessionStorage.setItem('editor._draggingModalOffset.' + compKey, JSON.stringify(dragLogRef.current.offset));
        document.getElementsByTagName('html')[0].classList.remove('global-dragging-cursor');
      };
    }, [isHeaderDragging]);

    useEffect(() => {
      if (!isHeaderDragging) {
        return;
      }

      const { x: left, y: top } = modalTranslate;
      if (left && top) {
        const posX = Math.min(Math.max(left, 0), clientSize.current.w - width);
        const posY = Math.min(Math.max(top, 0), clientSize.current.h - dragLogRef.current.height);
        setOffset({ top: posY, left: posX });
      }
    }, [isHeaderDragging, modalTranslate]);

    useLayoutEffect(() => {
      if (isResizeBarDragging) {
        document.getElementsByTagName('html')[0].classList.add('global-resize-y-cursor');
      }

      return () => {
        sessionStorage.setItem('editor._draggingModalHeight.' + compKey, dragLogRef.current.height.toString());
        document.getElementsByTagName('html')[0].classList.remove('global-resize-y-cursor');
      };
    }, [isResizeBarDragging]);

    useEffect(() => {
      if (!isResizeBarDragging) {
        return;
      }

      if (modalSize.y) {
        const height = Math.min(Math.max(modalSize.y, 200), clientSize.current.h - dragLogRef.current.offset.top);
        setHeight(height);
      }
    }, [isResizeBarDragging, modalSize]);
    const { token } = theme.useToken();

    const renderDom = (
      <div
        className={cx(styles.content, css({ background: token.colorBgContainer }))}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate3d(${offset.left}px,${offset.top}px,0 )`,
        }}
        onClick={event => event.stopPropagation()}
      >
        <div className={styles.header} ref={headerEleRef}>
          <div className={styles.headerTitle}>{t || title}</div>
        </div>
        <div className={styles.headerClose} onMouseDown={event => event.stopPropagation()} onClick={onClose}>
          <CloseOutlined />
        </div>
        <div className={styles.resizeY} ref={resizeEleRef}>
          <HamburgerButton theme="outline" size="10" fill="#333" />
        </div>
        <div className={styles.contentBody}>
          <div className={styles.contentScrollBox}>
            <Component {...(props as unknown as T)} />
          </div>
        </div>
      </div>
    );
    return ReactDOM.createPortal(renderDom, document.body);
  };
}
