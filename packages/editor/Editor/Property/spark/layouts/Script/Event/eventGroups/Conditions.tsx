import store, { checkOperandError, checkScripts, useEditor } from '@editor/aStore';
import { checkOperandRef } from '@editor/aStore/selectors/useScriptRef';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import render from '@editor/Editor/Property/cells';
import { ArrayCell } from '@editor/Editor/Property/cells/views/ArrayCell';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { Fragment } from 'react';
import { formulaSpark } from '../../../../common/formulaSpark';
import { useVariable } from '../../../../common/storeSelectSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';
import { expressionSpark, ExpressionSummary } from '../components/expression';
import { getExpressionKeys } from '../components/operand';

export const Conditions: IEventDesc = {
  name: '条件判断',
  category: '逻辑修改',
  link: 'https://magicplay.oceanengine.com/tutorials/middle/four',
  extraProps: ({ enableBlueprint } = {}) => ({
    conditions: [
      {
        from: enableBlueprint
          ? { ids: [undefined], type: 'scene', key: undefined }
          : { ids: [-1], key: 'alpha', type: 'node' },
        to: 1,
        compare: '=',
      },
    ],
    scripts: [],
    elseScripts: [],
  }),
  checkRef({ conditions = [] }, nodeIds) {
    for (const { from, to } of conditions) {
      const hasRef = checkOperandRef(from, nodeIds) || checkOperandRef(to, nodeIds);
      if (hasRef) return hasRef;
    }
    return false;
  },
  checkError({ conditions, scripts, elseScripts }, { deep }) {
    const state = store.getState().project;
    const {
      editor: { enableBlueprint },
    } = state;

    if (!conditions?.length) {
      return '未设置判断条件';
    }
    if (enableBlueprint) return '';
    for (const { from, to } of conditions) {
      const error = checkOperandError(from, state) || checkOperandError(to, state);
      if (error) return error;
    }
    if (!scripts?.length && !elseScripts?.length) {
      return '未设置执行事件';
    }
    return checkScripts(scripts, state, deep) || checkScripts(elseScripts, state, deep);
  },
  Summary({ props: { time, conditions = [] } }) {
    return (
      <>
        {delay(time)}
        {(conditions as any[]).map((condition, index) => (
          <Fragment key={index}>
            {index === 0 ? '' : '且'}
            <ExpressionSummary expression={condition} keys={['from', 'compare', 'to']} operator="compare" />
          </Fragment>
        ))}
      </>
    );
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        {
          spark: 'value',
          index: 'conditions',
          content(conditions = [], onChange) {
            return {
              spark: 'element',
              content() {
                const variables = useVariable();
                const { enableBlueprint } = useEditor(0, 'enableBlueprint');

                return (
                  <ArrayCell
                    label="条件判断"
                    array={conditions}
                    defaultItem={{
                      from: { ids: [-1], key: 'alpha', type: 'node' },
                      compare: '=',
                      to: 1,
                    }}
                    onChange={onChange}
                    render={(value, onChange) => {
                      const keys = getExpressionKeys(value, variables);
                      return render(
                        expressionSpark(value, onChange, keys, 'compare', options =>
                          enableBlueprint ? options : options.filter(opt => opt.value !== 'scene')
                        )
                      );
                    }}
                  />
                );
              },
            };
          },
        },
      ],
    },
  },
};
