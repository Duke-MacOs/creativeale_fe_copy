import { useEditor } from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { useVariable } from '../../../../common/storeSelectSpark';
import { IEventDesc, time_SPARK } from '../common';
import { expressionSpark } from '../components/expression';
import { getExpressionKeys } from '../components/operand';
import { ModifyData } from './ModifyData';

export const ModifyProperty: IEventDesc = {
  ...ModifyData,
  name: '修改属性',
  extraProps: ({ enableBlueprint } = {}) => ({
    expression: {
      from: { ids: [enableBlueprint ? undefined : -1], key: 'alpha', type: 'node' },
      to: 1,
      mode: '=',
    },
  }),
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
          index: 'expression',
          content(value, onChange) {
            const variables = useVariable();
            const { enableBlueprint } = useEditor(0, 'enableBlueprint');
            const keys = getExpressionKeys(value, variables);

            return expressionSpark(value, onChange, keys, 'mode', (options, operator, key) =>
              operator === 'mode' && key === 'from'
                ? options.filter(opt => opt.value === 'node')
                : enableBlueprint
                ? options.filter(opt => opt.value !== 'store')
                : options.filter(opt => opt.value !== 'scene')
            );
          },
        },
      ],
    },
  },
};
