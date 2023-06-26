import { ISceneAnalysisData, ISceneFlowData } from '../type';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
  NodeChange,
  EdgeChange,
} from 'react-flow-renderer';
import { Badge, Empty, Space } from 'antd';
import { omit } from 'lodash';
import { useRef, useState } from 'react';
import { useEventBus } from '@byted/hooks';
import { PreviewerContent } from '@editor/Editor/Header/headers/Project/Preview/PreviewerContent';
import { useEffect } from 'react';
import { GameConsole, ReplayMusic } from '@icon-park/react';
import StateContainer from './StateContainer';
import { PushpinFilled } from '@ant-design/icons';

const StartPositionX = 250;
const StartPositionY = -170;
const StepX = 250;
const StepY = 75;

const SelectEdgeProps = {
  style: { stroke: 'blue' },
  labelBgPadding: [8, 4],
  labelBgBorderRadius: 4,
  labelBgStyle: { fill: '#FFCC00', color: '#fff', fillOpacity: 0.7 },
  animated: true,
};
const SelectNodeProps: Partial<Node> = {
  style: {
    background: 'blue',
    color: 'white',
  },
};

type IBluePrintData = {
  nodes: Node[];
  edges: Edge[];
};

const translateData = (data: ISceneFlowData): IBluePrintData => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!data.edges || !data.edges.length || !data.sections) return { nodes, edges };

  // 找到起始图块
  const startEdge = data.edges
    .filter(i => !i.source)
    .reduce((prev, cur) =>
      cur.count > prev.count || data.sections?.find(i => i.id === prev.target)?.name === '离开' ? cur : prev
    );
  const startSection = data.sections.find(i => i.id === startEdge.target)!;
  nodes.push({
    id: `${startSection?.id}`,
    type: 'custom',
    data: {
      section: startSection.section,
      name: startSection.name,
      label: (
        <>
          <p>{startSection?.name}</p>
          <p>{startEdge.count}</p>
        </>
      ),
    },
    position: { x: StartPositionX, y: StartPositionY },
    sourcePosition: Position.Right,
    targetPosition: Position.Bottom,
  });

  // 找到结束图块
  // const endSection = data.sections.find(i => i.name === '离开');
  // nodes.push({
  //   id: `${endSection?.id}`,
  //   data: {
  //     section: endSection?.section,
  //     name: endSection?.name,
  //     label: <p>{endSection?.name}</p>,
  //   },
  //   position: { x: EndPositionX, y: EndPositionY },
  // });

  const sortSections = [data.sections.find(i => i.id === startSection.id)];
  let idx = 0,
    x = StartPositionX + StepX,
    y = -160,
    section = sortSections[idx];
  while (section) {
    const prevLength = nodes.length;
    // 设置连线
    data.edges.forEach(e => {
      if (e.source === section?.id) {
        if (e.rate > 0.005) {
          edges.push({
            id: `${e.source}-${e.target}`,
            source: `${e.source}`,
            target: `${e.target}`,
            label: `${e.count}(${(e.rate * 100).toFixed(0)}%)`,
            type: 'smoothstep',
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: '#FF0072',
            },
          });
        }
      }
    });
    // 设置图块
    edges.forEach(e => {
      if (!nodes.find(i => i.id === `${e.target}`)) {
        // 排除"离开"图块
        const section = data.sections?.find(i => `${i.id}` === e.target && i.name !== '离开');
        if (section) {
          if (!sortSections.find((i: any) => i.id === section?.id)) sortSections.push(section);
          nodes.push({
            id: `${section?.id}`,
            data: {
              section: section?.section,
              name: section?.name,
              label: <p>{section?.name}</p>,
            },
            position: { x, y },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          });
          y += StepY;
        }
      }
    });
    if (prevLength !== nodes.length) x += StepX;
    // y = -160;
    section = sortSections[++idx];
  }

  return { nodes, edges };
};

const SceneAnalysisData = ({
  sceneAnalysisData,
  section,
}: {
  sceneAnalysisData: ISceneAnalysisData | undefined;
  section: string;
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: '1px',
        width: '200px',
        padding: '30px 0 30px 20px',
        marginRight: '1px',
        borderRadius: '6px',
        backgroundColor: '#f2f4f8',
      }}
    >
      <PushpinFilled style={{ color: 'rgb(117 158 224)', fontSize: '25px', position: 'absolute', right: 0, top: 0 }} />
      <Space direction="vertical">
        <Badge
          color="purple"
          text={
            <>
              展示数：<span>{sceneAnalysisData?.show_data?.find(i => i.name === section)?.value ?? ''}</span>
            </>
          }
        />
        <Badge
          color="red"
          text={
            <>
              skip数：<span>{sceneAnalysisData?.skip_data?.find(i => i.name === section)?.value ?? ''}</span>
            </>
          }
        />
        <Badge
          color="yellow"
          text={
            <>
              点击数：<span>{sceneAnalysisData?.click_data?.find(i => i.name === section)?.value ?? ''}</span>
            </>
          }
        />
        <Badge
          color="orange"
          text={
            <>
              结束蒙层点击数：
              <span>{sceneAnalysisData?.click_at_background_ad_data?.find(i => i.name === section)?.value ?? ''}</span>
            </>
          }
        />
        <Badge
          color="cyan"
          text={
            <>
              转化bar点击数：
              <span>{sceneAnalysisData?.click_at_draw_ad_data?.find(i => i.name === section)?.value ?? ''}</span>
            </>
          }
        />
      </Space>
    </div>
  );
};

const SceneFlowView = ({
  data,
  setDetailSection,
}: {
  data: IBluePrintData;
  setDetailSection: (name: string) => void;
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.edges);
  const { unsubscribe } = useEventBus('listenMessage', (names: string[]) => {
    console.log('listenMessage data:', names);
    const ids = names.map(name => nodes.find(node => node.data.name === name)?.id ?? '');
    onSelectNode(ids);
  });

  useEffect(() => {
    return unsubscribe;
  }, []);

  const onSelectNode = (ids: string[]) => {
    setNodes(
      nodes.map(node =>
        ids.includes(node.id) ? { ...node, ...SelectNodeProps } : (omit(node, Object.keys(SelectNodeProps)) as Node)
      )
    );
    if (ids.length === 2) {
      // 如果选中的是两个，那么只高亮两者之间的连线
      setEdges(
        edges.map(edge =>
          ids.includes(edge.source) && ids.includes(edge.target)
            ? { ...edge, ...(SelectEdgeProps as any) }
            : (omit(edge, Object.keys(SelectEdgeProps)) as Edge)
        )
      );
    } else {
      setEdges(
        edges.map(edge =>
          ids.includes(edge.source) || ids.includes(edge.target)
            ? { ...edge, ...(SelectEdgeProps as any) }
            : (omit(edge, Object.keys(SelectEdgeProps)) as Edge)
        )
      );
    }
  };

  return (
    <ReactFlow
      style={{ border: '1px solid #DCD9D4', borderRadius: '5px' }}
      nodes={nodes}
      edges={edges}
      onNodeClick={(event: any, node: any) => {
        setDetailSection(node?.data.section);
      }}
      onNodesChange={(changes: NodeChange[]) => {
        console.log('node changes:', changes);
        if (changes[0].type === 'select') {
          const select: string[] = [];
          changes.forEach(change => {
            if (change.type === 'select' && change.selected) {
              select.push(change.id);
            }
          });
          onSelectNode(select);

          // 单选查看 section 详情
          setDetailSection('');
        }
        onNodesChange(changes);
      }}
      onEdgesChange={(changes: EdgeChange[]) => {
        const change = changes[0];
        if (change.type === 'select') {
          onSelectNode(change.selected ? change.id.split('-') : []);
        }
        onEdgesChange(changes);
      }}
      onInit={() => {
        console.log('scene flow view init');
      }}
      attributionPosition="bottom-left"
      fitView
      zoomOnScroll={false}
      preventScrolling={false}
    >
      <Controls />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

export const SceneFlow = StateContainer(
  ({
    sceneFlowData,
    visible,
    sceneAnalysisData,
    currentPlayableData,
  }: {
    sceneFlowData: ISceneFlowData | undefined;
    visible: boolean;
    sceneAnalysisData: ISceneAnalysisData | undefined;
    currentPlayableData: {
      playableUrl: string;
      auditH5: string;
      direct_playable_type: number;
    };
  }) => {
    const { playableUrl, auditH5 } = currentPlayableData;
    const PreviewUrl = (playableUrl.startsWith('aweme') ? auditH5 : playableUrl) || '';
    const ref = useRef<HTMLIFrameElement>(null);
    const trackPath = useRef<string[]>([]);
    const [previewId, setPreviewId] = useState(1);
    const [detailSection, setDetailSection] = useState('');
    const [visiblePlay, setVisiblePlay] = useState(visible);
    const { trigger } = useEventBus('listenMessage');
    const onReplay = () => {
      setPreviewId(id => id + 1);
    };
    return (
      <div
        style={{
          width: '100%',
          height: '500px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '25px 10px 25px 30px',
        }}
      >
        {sceneFlowData?.sections ? (
          <>
            <div style={{ position: 'absolute', top: -41, left: 90, zIndex: 2 }}>
              <GameConsole
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setVisiblePlay(v => !v);
                }}
                theme="outline"
                size="20"
                fill={visiblePlay ? '#f5a623' : 'gray'}
              />
              {visiblePlay && (
                <ReplayMusic
                  style={{ cursor: 'pointer', marginLeft: '5px' }}
                  onClick={onReplay}
                  theme="outline"
                  size="20"
                  fill="#f5a623"
                />
              )}
            </div>
            {visiblePlay && PreviewUrl !== '' && (
              <PreviewerContent
                key={`${previewId}`}
                ref={ref}
                width={375 * 0.7}
                height={667 * 0.7}
                httpUrl={`${PreviewUrl}?recorder=true&previewMode=true`}
                onEventTracked={data => {
                  if (data.params.section_remark === '进入主场景') {
                    trackPath.current = ['', data.params.section_remark];
                  }
                  data.params.section_remark && trackPath.current.push(data.params.section_remark);

                  trigger(trackPath.current.slice(-2));
                }}
                onReplay={() => {
                  console.log('onReplay');
                }}
              />
            )}
            <div
              style={{
                marginLeft: '10px',
                flex: 1,
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <SceneFlowView data={translateData(sceneFlowData)} setDetailSection={setDetailSection} />
              <SceneAnalysisData sceneAnalysisData={sceneAnalysisData} section={detailSection} />
            </div>
          </>
        ) : (
          <Empty style={{ flex: '1' }} />
        )}
      </div>
    );
  },
  'sceneFlow',
  { width: '100%', height: '600px' }
);
