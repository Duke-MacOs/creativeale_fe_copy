import { useEffect, useMemo, useContext, createContext, ReactNode } from 'react';
import Draggable from 'react-draggable';
import { useCurrent } from '../utils';
import { Modal } from 'antd';
import { css } from 'emotion';

const className = css({
  pointerEvents: 'none',
  '.ant-modal-header': {
    border: 'none',
  },
  '.ant-collapse-header': {
    paddingLeft: '0!important',
    paddingRight: '0!important',
  },
  '.ant-collapse-content-box': {
    paddingLeft: '0!important',
    paddingRight: '0!important',
  },
  '.ant-modal-footer': {
    textAlign: 'center',
    cursor: 'ns-resize',
    lineHeight: '12px',
    padding: 0,
  },
  '.ant-collapse': {
    borderTop: 'none',
  },
});

const CANCELS: Array<{ current: () => void } | undefined> = [];
const DepthContext = createContext(0);
const POSITIONS = [{ x: 0, y: 0 }];

const usePosition = (onCancel: () => void, children: ReactNode) => {
  const index = useContext(DepthContext);
  const cancel = useCurrent(onCancel);

  const position = useMemo(() => {
    if (!POSITIONS[index]) {
      const { x, y } = POSITIONS[index - 1];
      POSITIONS.push({ x: x + 56, y: y + 56 });
    }
    return POSITIONS[index];
  }, [index]);

  useEffect(() => {
    CANCELS[index]?.current();
    CANCELS[index] = cancel;
    return () => {
      if (CANCELS[index] === cancel) {
        CANCELS[index] = undefined;
      }
    };
  }, [cancel, index]);

  return {
    position,
    context: <DepthContext.Provider value={index + 1}>{children}</DepthContext.Provider>,
    setPosition(p: typeof position) {
      const { x, y } = POSITIONS[index];
      const [dx, dy] = [p.x - x, p.y - y];
      for (let i = index; i < POSITIONS.length; i++) {
        POSITIONS[i].x += dx;
        POSITIONS[i].y += dy;
      }
    },
  };
};
export interface TreeModalProps {
  title: React.ReactNode;
  children: React.ReactNode;
  width?: number;
  zIndex?: number;
  onCancel: () => void;
}

export const TreeModal = ({ onCancel, title, children, width = 340, zIndex = 2 }: TreeModalProps) => {
  const { context, position, setPosition } = usePosition(onCancel, children);
  const refId = useMemo(() => `id${Date.now()}`, []);
  const header = (
    <div
      id={refId}
      className={css({
        width: '100%',
        cursor: 'move',
      })}
    >
      {title}
    </div>
  );

  return (
    <Modal
      open
      mask={false}
      width={width}
      footer={null}
      zIndex={zIndex}
      title={header}
      maskClosable={false}
      onCancel={onCancel}
      transitionName=""
      maskTransitionName=""
      wrapClassName={className}
      bodyStyle={{ overflow: 'auto', padding: '0 0 16px', maxHeight: 640, minHeight: width }}
      modalRender={modal => (
        <Draggable
          handle={`#${refId}`}
          defaultPosition={position}
          onStop={(_, { x, y }) => {
            setPosition({ x, y });
          }}
        >
          {modal}
        </Draggable>
      )}
    >
      {context}
    </Modal>
  );
};
