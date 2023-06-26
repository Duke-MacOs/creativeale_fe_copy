import ReactFlow, { Background, ControlButton, Controls } from 'react-flow-renderer';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { useNodes, useEdges } from './useNodeEdges';
import { useFullscreen } from '@byted/hooks';
import { useEditor } from '@editor/aStore';
import { Modal, Tooltip } from 'antd';
import nodeTypes from './nodeTypes';
import { useEffect } from 'react';
import { css } from 'emotion';

export default ({ onClose }: any) => {
  const { ref, isFullscreen, setFull, exitFull } = useFullscreen();
  const { edges, onConnect, onEdgesChange } = useEdges();
  const { nodes, onNodesChange } = useNodes();
  useDisabledHotKeys();
  return (
    <Modal
      title="视频故事板"
      centered
      open
      footer={null}
      width={1334}
      onCancel={onClose}
      maskClosable={false}
      bodyStyle={{ height: 750, padding: 0 }}
      className={css({
        maxWidth: 'unset',
      })}
    >
      <div ref={ref} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          fitView
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onConnect={onConnect}
          attributionPosition="bottom-left"
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
        >
          <Background />
          <Controls showInteractive={false} style={{ bottom: 32 }}>
            <ControlButton
              onClick={() => {
                if (isFullscreen) {
                  exitFull();
                } else {
                  setFull();
                }
              }}
            >
              <Tooltip
                getPopupContainer={() => ref!.current!}
                title={isFullscreen ? '退出全屏' : '进入全屏'}
                placement="right"
              >
                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </Tooltip>
            </ControlButton>
          </Controls>
        </ReactFlow>
      </div>
    </Modal>
  );
};

const useDisabledHotKeys = () => {
  const { onChange } = useEditor(0, 'enableBlueprint');
  useEffect(() => {
    onChange(true);
    return () => {
      onChange(false);
    };
  }, [onChange]);
};
