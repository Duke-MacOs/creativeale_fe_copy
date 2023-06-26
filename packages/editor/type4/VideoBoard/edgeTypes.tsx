import { Dropdown, Menu } from 'antd';
import { EdgeProps, getBezierPath, getEdgeCenter, EdgeText, useReactFlow } from 'react-flow-renderer';

export default {
  custom: ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label = '自动跳转',
  }: EdgeProps) => {
    const { setEdges } = useReactFlow();

    const edgePath = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    const [edgeCenterX, edgeCenterY] = getEdgeCenter({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });

    return (
      <>
        <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
        <Dropdown
          overlay={
            <Menu
              onClick={({ key: label }) => {
                setEdges(edges =>
                  edges.map(edge => {
                    return edge.id === id
                      ? {
                          ...edge,
                          label,
                          style: { stroke: edge.selected ? 'pink' : '#333' },
                          animated: label !== '自动跳转',
                        }
                      : edge;
                  })
                );
              }}
            >
              <Menu.Item key="自动跳转">自动跳转</Menu.Item>
              <Menu.Item key="互动跳转">互动跳转</Menu.Item>
            </Menu>
          }
        >
          <EdgeText
            x={edgeCenterX}
            y={edgeCenterY}
            label={`${label} *`}
            labelStyle={{ fill: '#333' }}
            labelShowBg
            labelBgStyle={{ fill: '#fff' }}
            labelBgPadding={[2, 4]}
            labelBgBorderRadius={2}
          />
        </Dropdown>
      </>
    );
  },
};
