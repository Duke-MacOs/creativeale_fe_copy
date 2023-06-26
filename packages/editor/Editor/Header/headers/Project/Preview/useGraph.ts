import G6, { Graph } from '@antv/g6';
import React, { useEffect, useRef, useState } from 'react';

const data = {
  nodes: [{ id: 'start', label: 'start', x: 100, y: 100 }],
};

export const useNewGraph = (containerRef: React.MutableRefObject<HTMLDivElement | null>) => {
  const [currentId, setCurrentId] = useState('');
  const graphRef = useRef<Graph | null>(null);
  // 支持双指拖动移动和鼠标滚轮移动画布
  G6.registerBehavior('double-finger-drag-canvas', {
    getEvents: () => ({
      wheel: 'onWheel',
    }),
    onWheel: (ev: any) => {
      if (ev.ctrlKey) {
        const canvas = graphRef.current?.get('canvas');
        const point = canvas.getPointByClient(ev.clientX, ev.clientY);
        let ratio = graphRef.current?.getZoom() ?? 0;
        if (ev.wheelDelta > 0) {
          ratio = ratio + ratio * 0.05;
        } else {
          ratio = ratio - ratio * 0.05;
        }
        graphRef.current?.zoomTo(ratio, {
          x: point.x,
          y: point.y,
        });
      } else {
        const x = ev.deltaX || ev.movementX;
        const y = ev.deltaY || ev.movementY;
        graphRef.current?.translate(-x, -y);
      }
      ev.preventDefault();
    },
  });
  useEffect(() => {
    // 初始化配置
    graphRef.current = new G6.Graph({
      container: containerRef.current!,
      width: 630,
      height: 190,
      layout: {
        rankdir: 'LR',
        align: 'UL',
        controlPoints: true,
        nodesepFunc: () => 1,
        ranksepFunc: () => 1,
      },
      modes: {
        default: ['double-finger-drag-canvas', 'drag-canvas', 'drag-node'],
      },
      defaultNode: {
        size: [120, 30],
        type: 'rect',
        labelCfg: {
          style: {
            fill: '#333',
          },
        },
        style: {
          lineWidth: 1,
          radius: 15,
          stroke: '#ebebeb',
          fill: '#fafafa',
        },
      },
      defaultEdge: {
        type: 'polyline',
        size: 1,
        style: {
          stroke: '#e2e2e2',
          // 箭头样式
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#e2e2e2',
          },
          radius: 20,
          // 可响应edge 宽度
          lineAppendWidth: 8,
        },
        // edge 上文字样式
        labelCfg: {
          refY: 10,
        },
      },
      // 节点不同状态下的样式集合
      nodeStateStyles: {
        // 鼠标点击节点，即 click 状态为 true 时的样式
        click: {
          fill: '#0672FF',
        },
      },
      // 边不同状态下的样式集合
      edgeStateStyles: {
        // 鼠标点击边，即 click 状态为 true 时的样式
        click: {
          stroke: '#0672FF',
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#0672FF',
          },
        },
        last: {
          stroke: '#6ABF40',
          endArrow: {
            path: 'M 0,0 L 8,4 L 8,-4 Z',
            fill: '#6ABF40',
          },
        },
      },
    });
    graphRef.current.data(data);
    graphRef.current.render();

    graphRef.current?.on('node:click', (evt: any) => {
      const item = evt.item; // 被操作的节点 item
      clickItem(item);
    });
    graphRef.current?.on('edge:click', (evt: any) => {
      const item = evt.item; // 被操作的节点 item
      item.toFront();
      graphRef.current?.paint();
      clickItem(item);
    });
    const clickItem = (item: any) => {
      graphRef.current?.findAllByState('node', 'click').forEach((cn: any) => {
        graphRef.current?.setItemState(cn, 'click', false);
        graphRef.current?.updateItem(cn, {
          labelCfg: { style: { fill: '#333' } },
        });
      });
      graphRef.current?.findAllByState('edge', 'click').forEach((cn: any) => {
        graphRef.current?.setItemState(cn, 'click', false);
      });

      setCurrentId(currentId => {
        if (item._cfg.id !== currentId) {
          graphRef.current?.updateItem(item, {
            labelCfg: { style: { fill: '#fefefe' } },
          });
          setCurrentId(item._cfg.id);
          graphRef.current?.setItemState(item, 'click', true); // 设置当前节点的 click 状态为 true
          return item._cfg.id;
        } else {
          return '';
        }
      });
    };
    return () => {
      graphRef.current?.destroy();
      graphRef.current = null;
    };
  }, [containerRef]);

  return {
    currentId,
    addNode(prev: string, next: string, nextShowNum: number, edgeLabel: string) {
      const nodes = graphRef.current?.getNodes();
      if (nodes?.length === 0) {
        graphRef.current?.data(data);
        graphRef.current?.render();
      }
      const preNode = graphRef.current?.findById(prev);
      const nextNode = graphRef.current?.findById(next);
      // 获取节点的x坐标
      const preNode_x = preNode?.get('model').x ?? 100;
      const nextNode_x = nextNode?.get('model').x ?? 100;
      const preNode_y = preNode?.get('model').y ?? 100;
      const nextNode_y = nextNode?.get('model').y ?? 100;

      if (nextNode) {
        nextNode.update({ label: `${next}\n展示数:${nextShowNum}` });
        // 如果要绘制的目标节点已经存在,判断是否存在连接线，若没有则新增一条连接线
        const preToNext: any = graphRef.current?.findById(`edge_${prev}_${next}`);
        const nextToPre: any = graphRef.current?.findById(`edge_${next}_${prev}`);

        if (!preToNext) {
          graphRef.current?.addItem('edge', {
            id: `edge_${prev}_${next}`,
            source: prev || 'start',
            target: next,
            label: prev ? `${edgeLabel}%` : '',
            type: nextNode_y - preNode_y === 0 ? 'quadratic' : 'polyline',
            controlPoints:
              nextNode_y - preNode_y === 0
                ? [{ x: (nextNode_x + preNode_x) / 2, y: nextToPre ? nextNode_y - 80 : nextNode_y + 80 }]
                : [],
          });
        }
      } else {
        // 若不存在，查找source上有没有连接其他目标节点
        const oldTargets = (preNode as any)?.getNeighbors('target');
        // 调整新节点的y坐标以避免重叠
        let num = 0;
        for (let i = 0; i < oldTargets?.length; i++) {
          if (oldTargets[i]?.get('model').y > num) {
            num = oldTargets[i]?.get('model').y;
          }
        }

        //新增节点
        graphRef.current?.addItem('node', {
          id: next, // Generate the unique id
          label: `${next}\n展示数:${nextShowNum}`,
          x: preNode_x + 180,
          y: num + 100,
        });
        // 新增连接线
        graphRef.current?.addItem('edge', {
          id: `edge_${prev}_${next}`,
          source: prev || 'start',
          label: prev ? `${edgeLabel}%` : '',
          target: next,
          type: 'line',
        });
      }

      // 找到当前环节的连接线设置成不同颜色
      graphRef.current?.findAllByState('edge', 'last').forEach((cn: any) => {
        graphRef.current?.setItemState(cn, 'last', false);
      });
      const lastEdge: any = graphRef.current?.findById(`edge_${prev}_${next}`);
      graphRef.current?.setItemState(lastEdge, 'last', true);
      lastEdge.toFront();
      graphRef.current?.paint();
    },

    clear() {
      graphRef.current?.clear();
    },
    amplify() {
      graphRef.current?.zoom(2);
    },
    minify() {
      graphRef.current?.zoom(0.5);
    },
  };
};
