import { W, H } from '@editor/type4/StoryBoard/nodeTypes';
import { UploadEntry } from '@editor/Resource/upload';
import { useEffect } from 'react';
import { countBy } from 'lodash';
import {
  useNodesState,
  applyNodeChanges,
  NodeChange,
  useEdgesState,
  Connection,
  addEdge,
  applyEdgeChanges,
  EdgeChange,
  Edge,
} from 'react-flow-renderer';

export const useNodeEdges = (videos: UploadEntry[]) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  useEffect(() => {
    if (videos.length) {
      const positions = Array.from({ length: videos.length + 1 }).map((_, index) => {
        const [row, col] = [Math.floor((index + 1) / 6), (index + 1) % 6];
        return { x: W + col * (W + H), y: H + row * (H + W) };
      });
      const newNodes = videos.map(({ id, url, name }, index) => {
        return {
          type: 'video',
          id: String(id),
          position: positions[index + 1],
          data: { url, name },
        };
      });
      setNodes(nodes => {
        return [
          {
            type: 'start',
            id: '0',
            position: positions[0],
            data: { url: '', name: '' },
          },
          ...newNodes,
        ].map((node, index) => {
          const oldNode = nodes.find(({ id }) => id === node.id);
          if (oldNode) {
            return {
              ...oldNode,
              position: positions.some(({ x, y }) => x === oldNode.position.x && oldNode.position.y === y)
                ? positions[index]
                : oldNode.position,
            };
          }
          return node;
        });
      });
      if (newNodes.length) {
        setEdges(edges => {
          if (edges.some(({ source, target }) => source === '0' && newNodes.some(({ id }) => id === target))) {
            return edges;
          }
          return edges.concat(
            addEdge({ source: '0', target: newNodes[0].id, sourceHandle: null, targetHandle: null, zIndex: 1 }, edges)
          );
        });
      }
    }
  }, [videos, setNodes, setEdges]);
  return {
    nodes,
    edges,
    onNodesChange: (changes: NodeChange[]) =>
      setNodes(nodes =>
        applyNodeChanges(
          changes.filter(({ type }) => type !== 'remove'),
          nodes
        )
      ),
    onConnect: (connection: Connection) => {
      if (connection.source === connection.target) {
        return;
      }
      setEdges(edges =>
        resolveEdges(
          connection.source === '0'
            ? addEdge(
                connection,
                edges.filter(({ source, target }) => source !== '0' && target !== connection.target)
              )
            : connection.target !== edges.find(({ source }) => source === '0')?.target
            ? addEdge(connection, edges)
            : edges
        )
      );
    },
    onEdgesChange: (changes: EdgeChange[]) => {
      setEdges(edges =>
        resolveEdges(
          applyEdgeChanges(
            changes.filter(change => {
              if (change.type === 'remove' && edges.find(({ id }) => id === change.id)?.source === '0') {
                return false;
              }
              return true;
            }),
            edges
          )
        )
      );
    },
  };
};

const resolveEdges = (edges: Edge[]) => {
  const count = countBy(edges, 'source');

  return edges.map(edge => {
    if (edge.source === '0') {
      return edge;
    }
    const manual = count[edge.source] > 1;
    return {
      ...edge,
      zIndex: 1,
      type: manual ? 'default' : 'custom',
      style: { stroke: edge.selected ? 'pink' : '#333' },
      ...(manual ? { label: '互动跳转', animated: true } : {}),
    };
  });
};
