import { findById, getNodes, getScene, getSelectedIds } from '@editor/utils';
import { highlight } from '../../Script/Event/common/highlight';
import { ImageSelectCell } from './ImageSelectCell';
import { INodeState, useEditor } from '@editor/aStore';
import { shallowEqual, useSelector } from 'react-redux';

export interface NodeCellProps {
  isType?: (type: string) => boolean;
  value: number;
  label?: string;
  tooltip?: string;
  deletable?: boolean;
  onChange: (value: number | string | undefined, options?: any) => void;
  /**
   * 包括节点自身
   */
  includeSelf?: boolean;
  disabled?: boolean;
}

export const NodeCell = ({
  isType,
  value,
  label,
  tooltip,
  deletable,
  includeSelf,
  onChange,
  disabled,
}: NodeCellProps) => {
  const options = useNodeOptions(isType, includeSelf);
  return (
    <ImageSelectCell
      disabled={disabled}
      label={label}
      value={value}
      tooltip={tooltip}
      options={options}
      deletable={deletable}
      onChange={onChange}
      invalidLabel={value => (value !== undefined ? '素材不存在，请重新选择' : '请选择')}
    />
  );
};

export function useNodeOptions(isType = (_type: string) => true, includeSelf = true) {
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const { blueprintState } = useEditor(0, 'blueprintState');

  return useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const sceneNodes = getNodes(scene);
    const {
      props,
      editor: { selected },
    } = scene;
    const {
      nodeIds: [nodeId],
    } = getSelectedIds(selected);
    let nodes: INodeState[] = [];
    if (enableBlueprint && blueprintState?.type === 'Node') {
      const [node] = findById(sceneNodes, blueprintState.id);
      if (node) {
        nodes = Array.from(flattenNodes([node]));
      }
    } else {
      nodes = Array.from(flattenNodes(sceneNodes));
    }

    const options = nodes
      .filter(node => {
        return isType(node.type) && (includeSelf || node.id !== nodeId);
      })
      .map(({ id, type, name }) => ({
        type: type as string,
        value: id,
        label: name,
        cover: props[id]._editor?.cover ?? (type === 'Sprite' ? props[id].url : ''),
      }));
    const self = options.find(({ value }) => value === nodeId);
    if (self && !(enableBlueprint && blueprintState?.type !== 'Node')) {
      options.splice(0, 0, {
        ...self,
        value: -1,
        label: (<>自身({highlight(self.label)})</>) as unknown as string,
      });
    }

    if (enableBlueprint && blueprintState?.type !== 'Node') {
      options.splice(0, 0, {
        value: -1,
        type: 'Scene',
        label: '当前场景',
        cover: '',
      });
    }

    return options;
  }, shallowEqual);
}

export function* flattenNodes(nodes: INodeState[]): Generator<INodeState> {
  for (const node of nodes) {
    yield node;
    if (node.nodes) {
      yield* flattenNodes(node.nodes);
    }
  }
}

export function useCurrentNodeId() {
  return useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const {
      editor: { selected },
    } = scene;
    const {
      nodeIds: [nodeId],
    } = getSelectedIds(selected);

    return nodeId;
  });
}

export function useNodeById(id?: number) {
  return useSelector(({ project }: EditorState) => {
    if (id) {
      const scene = getScene(project);
      const sceneNodes = getNodes(scene);
      const [node] = findById(sceneNodes, id);
      return node;
    }
  });
}
