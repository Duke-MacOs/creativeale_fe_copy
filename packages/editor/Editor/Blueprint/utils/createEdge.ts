import { Connection, Edge } from 'react-flow-renderer';

export function createEdge(
  edge: Omit<Edge, 'id' | 'source' | 'sourceHandle' | 'target' | 'targetHandle'> & { id?: string } & Connection
): Edge {
  const { source, sourceHandle, target, targetHandle, ...rest } = edge;
  if (!source || !target) {
    throw new Error('');
  }
  return {
    source,
    sourceHandle,
    target,
    targetHandle,
    id: createEdgeId({ source, sourceHandle, target, targetHandle }),
    style: { strokeWidth: 3 },
    ...rest,
  };
}

export function createEdgeId({ source, sourceHandle, target, targetHandle }: Connection) {
  return `${source}:${sourceHandle}-${target}:${targetHandle}`;
}
