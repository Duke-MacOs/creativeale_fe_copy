import { IScriptData } from '@byted/riko';
import { ISceneState } from '@editor/aStore';

// TODO: For compatibility only, should be removed in the future.
/**
 * 赋值事件和条件判断中使用的表达式express中的id改成ids
 */
export default ({ scene }: { projectId?: number; scene: ISceneState }) => {
  const { props } = scene;
  Object.values(props).forEach(({ type, scripts }) => {
    if (type === 'Script') {
      transformScript(scripts);
    }
  });

  return scene;
};

function transformScript(scripts: IScriptData[] = []) {
  for (const script of scripts) {
    if (script.props.script === 'ModifyData') {
      const { expression } = script.props as any;
      transformExpression(expression);
    }
    if (script.props.script === 'Condition') {
      script.props.script = 'Conditions';
      if (script.props.condition) {
        script.props.conditions = [script.props.condition];
      }
    }
    if (script.props.script === 'Conditions') {
      const { conditions = [] } = script.props as any;
      conditions.forEach((expression: any) => {
        transformExpression(expression);
      });
      transformScript(script.props.elseScripts);
      transformScript(script.props.scripts);
    }
  }
}

function transformExpression(expression: any) {
  if (expression) {
    const { from, to } = expression;
    if (from && from.id) {
      const { id, ...rest } = from;
      expression.from = {
        ...rest,
        ids: [id],
      };
    }
    if (to && to.id) {
      const { id, ...rest } = from;
      expression.to = {
        ...rest,
        ids: [id],
      };
    }
  }
}
