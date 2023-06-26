import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { IOperand } from '@editor/Editor/Property/spark/layouts/Script/Event/components/operand';
import { findById, getNodes, getScene, getSelectedIds, neverThrow } from '@editor/utils';
import { shallowEqual, useSelector } from 'react-redux';
import { IProps } from '..';

/**
 * 脚本是否内部引用了被选中的节点
 * @param id
 * @returns
 */
export const useScriptRef = (id: RikoScript['id']) => {
  const parentIsSelected = useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const nodes = getNodes(scene);
    const [node] = findById(nodes, id, true);
    const { nodeIds } = getSelectedIds(scene.editor.selected);
    return nodeIds.includes(node.id);
  });
  try {
    return useSelector(({ project }: EditorState) => {
      const scene = getScene(project);
      let { nodeIds } = getSelectedIds(scene.editor.selected);
      if (parentIsSelected) {
        nodeIds = nodeIds.concat(-1);
      }
      return { hasRef: checkPropsRef(scene.props[id], nodeIds), parentIsSelected };
    }, shallowEqual);
  } catch (err) {
    return { hasRef: false, parentIsSelected };
  }
};

export const checkPropsRef = (props: IProps | RikoScript['props'], nodeIds: number[]): boolean => {
  switch (props.script) {
    case 'Drag': {
      if (props.targetId && nodeIds.includes(props.targetId as number)) return true;
      break;
    }
    default: {
      const eventDesc = EVENTS[props.script as keyof typeof EVENTS];
      if (eventDesc && eventDesc.checkRef) {
        if (eventDesc.checkRef(props as RikoScript['props'], nodeIds)) return true;
      }
    }
  }

  if (props.scripts && checkScripts(props.scripts, nodeIds)) return true;
  if (props.elseScripts && checkScripts(props.elseScripts as RikoScript[], nodeIds)) return true;
  return false;
};

const checkScripts = (scripts: RikoScript[], nodeIds: number[]): boolean => {
  for (const script of scripts) {
    if (checkPropsRef(script.type === 'Effect' ? { ...script.props, script: script.type } : script.props, nodeIds))
      return true;
  }
  return false;
};

export const checkOperandRef = (operand: IOperand, nodeIds: number[]): boolean => {
  switch (typeof operand) {
    case 'object': {
      if (Array.isArray(operand)) {
        for (const op of operand) {
          if (checkOperandRef(op, nodeIds)) return true;
        }
      } else {
        switch (operand.type) {
          case 'node': {
            return operand.ids.some(id => nodeIds.includes(id));
          }
          case 'store':
          case 'res':
          case 'func':
          case 'mouse':
          case 'event':
          case 'scene':
            return false;
          default:
            return neverThrow(operand);
        }
      }
    }
  }
  return false;
};
