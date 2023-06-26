import { ICaseState, ISceneState } from '../project';
import { findById, getNodes, getScene, neverThrow } from '@editor/utils';
import { useSelector } from 'react-redux';
import { IOperand } from '@editor/Editor/Property/spark/layouts/Script/Event/components/operand';
import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { SCRIPTS } from '@editor/Editor/Property/spark/layouts/Script/Scripts';

export const useScriptError = (propsOrId: RikoScript['props'] | number) => {
  try {
    return useSelector(({ project }: EditorState) => {
      return checkPropsOrId(propsOrId, project);
    });
  } catch (err) {
    return '';
  }
};

const checkPropsOrId = (props: any | number = {}, state: ICaseState, deep = false): string => {
  const scene = getScene(state);
  if (typeof props === 'number') {
    return checkPropsOrId(scene.props[props], state, true) || checkScripts(scene.props[props]?.scripts, state, true);
  }

  switch (props.script) {
    // 触发方式
    case 'Drag':
      return checkTargetId(scene, props.targetId);
    case 'EventListener':
      return !props.event ? '未设置事件名称' : '';
    case 'DataListener':
      if (!props.key) {
        return '未设置变量名';
      }
      switch (props.key) {
        case 'SupportShake':
        case 'SceneLoadingProgress':
          return '';
        default:
          const { store = {} } = state.settings;
          return props.key in store ? '' : '变量名不存在';
      }
    default: {
      const eventDesc = ({ ...SCRIPTS, ...EVENTS } as any)[props.script];
      if (eventDesc && eventDesc.checkError) {
        return eventDesc.checkError(props, { deep, project: state });
      }
      return '';
    }
  }
};

export const checkScripts = (scripts: RikoScript[] = [], state: ICaseState, deep: boolean) => {
  if (deep) {
    for (const script of scripts) {
      const error = checkPropsOrId(
        script.type === 'Effect' ? { ...script.props, script: script.type } : script.props,
        state,
        deep
      );
      if (error) {
        return error;
      }
    }
  }
  return '';
};

export const checkOperandError = (operand: IOperand, state: ICaseState): string => {
  switch (typeof operand) {
    case 'number':
    case 'boolean':
      return '';
    case 'string':
      if (!operand.length) {
        return '未输入字符串内容';
      }
      return '';
    case 'object': {
      if (Array.isArray(operand)) {
        for (const op of operand) {
          const result = checkOperandError(op, state);
          if (result) return result;
        }
        return '';
      }
      switch (operand.type) {
        case 'node': {
          if (operand.ids && operand.ids[0] !== -1) {
            const nodes = getNodes(getScene(state));
            const [node] = findById(nodes, operand.ids[0]);
            if (!node) {
              return '素材节点已被删除';
            }
          }
          if (!operand.key) return '未选择素材属性';
          return '';
        }
        case 'res': {
          if (!operand.url) return '未上传素材资源';
          return '';
        }
        case 'store': {
          if (!operand.key) return '未选择全局变量';
          if (['SupportShake', 'SceneLoadingProgress'].includes(operand.key)) {
            return '';
          }
          const {
            settings: { store = {} },
          } = state;
          return operand.key in store ? '' : '全局变量已被删除';
        }
        case 'func':
          return (
            (operand.source !== undefined && checkOperandError(operand.source, state)) ||
            (operand.value !== undefined && checkOperandError(operand.value, state)) ||
            ''
          );
        case 'mouse':
        case 'event':
        case 'scene':
          return '';
        default:
          return neverThrow(operand);
      }
    }
    default:
      return neverThrow(operand);
  }
};

export const checkTargetId = (scene: ISceneState, targetId?: number, label = '目标节点') => {
  if (targetId === undefined) {
    return `未设置${label}`;
  }
  if (targetId > 0 && !scene.props[targetId]) {
    return `${label}不存在`;
  }
  return '';
};
