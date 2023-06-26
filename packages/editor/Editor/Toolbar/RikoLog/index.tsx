import { memo, useState, useRef, LegacyRef, useEffect } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import { classnest, collectEvent, EventTypes } from '@editor/utils';
import { Button, Modal, Tabs } from 'antd';
import { useSelector, shallowEqual } from 'react-redux';
import { useEmitter } from '@editor/aStore';
import { TitleTip } from '@editor/views';
import { Log } from '@icon-park/react';
import VariableTree from './VariableTree';
import Draggable from 'react-draggable';
import LogBoard from './LogBoard';
import { css } from 'emotion';
import { useEventBus } from '@byted/hooks';

export type VariableData = {
  key: string;
  name: string;
  value: string;
};

export type Log = {
  level: 'default' | 'log' | 'error';
  message: string;
};

export interface IVariableTable {
  variableData: VariableData[];
}

export interface IContent extends IVariableTable {
  logs: Log[];
  onClean: () => void;
  onClose: () => void;
}

let container: HTMLElement | undefined;

const RikoLog = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [disableDrag, setDisableDrag] = useState<boolean>(true);
  const [menuKey, setMenuKey] = useState<'log' | 'globalVar'>('log');
  const [modalPosition, setModalPosition] = useState({ left: 500, top: 200 });
  const { playing } = useSelector(({ project }: EditorState) => {
    return { playing: project.editor.playing };
  }, shallowEqual);
  const draggleRef: LegacyRef<HTMLDivElement> = useRef(null);
  const prevDraggleBoundRef = useRef<any>(null);

  useEmitter('UpdateRikoLog', (log: Log) => {
    setLogs([...logs, log]);
  });

  useEffect(() => {
    container = document.getElementById('rikoLogModal') ?? undefined;
  }, []);

  useEffect(() => {
    // 全局使用埋点
    if (visibleModal) {
      collectEvent(EventTypes.GlobalLog, { type: menuKey === 'log' ? '日志' : '全局变量' });
    }
  }, [menuKey, visibleModal]);

  useEffect(() => {
    if (prevDraggleBoundRef.current && !visibleModal) {
      setModalPosition({
        left: prevDraggleBoundRef.current.left,
        top: prevDraggleBoundRef.current.top,
      });
    }
  }, [visibleModal]);

  useEffect(() => {
    if (playing) setLogs([]);
  }, [playing]);

  const onOk = () => {
    setVisibleModal(false);
  };

  const onCancel = () => {
    setVisibleModal(false);
  };

  const onClickModal = () => {
    setVisibleModal(true);
  };

  useEventBus('RikoLog', (menu: typeof menuKey) => {
    setVisibleModal(true);
    if (menu) {
      setMenuKey(menu);
    }
  });

  const onStart = (event: any, uiData: { x: number; y: number }) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const onPickMenu = (key: any) => {
    setMenuKey(key);
  };

  const onClean = () => {
    setLogs([]);
  };

  const onDragEnd = () => {
    prevDraggleBoundRef.current = draggleRef.current?.getBoundingClientRect();
  };

  const Title = (
    <div
      className={modalTitleStyle}
      onMouseOver={() => {
        if (disableDrag) {
          setDisableDrag(false);
        }
      }}
      onMouseOut={() => {
        setDisableDrag(true);
      }}
    >
      <Tabs activeKey={menuKey} onChange={onPickMenu}>
        <Tabs.TabPane tab="日志" key="log" />
        <Tabs.TabPane tab="全局变量" key="globalVar" />
      </Tabs>
    </div>
  );

  return (
    <div className={classnest([buttonStyle])}>
      <TitleTip title="全局变量" placement="left">
        <Button type="text" onClick={onClickModal} icon={<GlobalOutlined />} />
      </TitleTip>
      <div id="rikoLogModal" className={modalBodyStyle} />
      <Modal
        title={Title}
        className={css({
          '.ant-modal-body': {
            padding: '12px 5px',
          },
        })}
        width="auto"
        transitionName=""
        style={modalPosition}
        keyboard={false}
        destroyOnClose={true}
        getContainer={container}
        wrapClassName="riko-log-modal"
        mask={false}
        maskClosable={false}
        open={visibleModal}
        footer={false}
        onOk={onOk}
        onCancel={onCancel}
        modalRender={modal => (
          <Draggable disabled={disableDrag} bounds={bounds} onStart={onStart} onStop={onDragEnd}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
      >
        <LogBoard logs={logs} visible={menuKey === 'log'} onClean={onClean} />
        <VariableTree visible={menuKey === 'globalVar'} isPlaying={playing === 1} />
      </Modal>
    </div>
  );
};

const buttonStyle = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 34,
  '.riko-log-modal': {
    width: '0px',
  },
  '.ant-modal': {
    position: 'fixed',
  },
  '.ant-modal-body': {
    position: 'relative',
  },
  '.ant-popover-inner-content': {
    padding: 0,
  },
});

const modalTitleStyle = css({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  cursor: 'move',
  '.ant-tabs-top > .ant-tabs-nav': {
    margin: 0,
  },
});

const modalBodyStyle = css({
  '.ant-tree': {
    background: 'inherit',
  },
  '.ant-tree-switcher': {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'inherit',
  },
  '.riko-log-modal': {
    width: '0',
  },
  '.ant-modal-wrap': {
    width: '0px',
  },
  '.ant-modal': {
    position: 'fixed',
  },
});

export const resizeStyle = css({
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
});

export default memo(RikoLog);
