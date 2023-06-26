import { GlobalOutlined } from '@ant-design/icons';
import { useEventBus } from '@byted/hooks';
import store, { checkOperandError, useEditor } from '@editor/aStore';
import { checkOperandRef } from '@editor/aStore/selectors/useScriptRef';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { Button } from 'antd';
import { formulaSpark } from '../../../../common/formulaSpark';
import { useVariable } from '../../../../common/storeSelectSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';
import { expressionSpark, ExpressionSummary } from '../components/expression';
import { getExpressionKeys } from '../components/operand';

export const ModifyData: IEventDesc = {
  name: '修改数据',
  category: '逻辑修改',
  link: 'https://magicplay.oceanengine.com/tutorials/middle/four',
  extraProps: ({ enableBlueprint } = {}) => ({
    expression: {
      from: { type: enableBlueprint ? 'scene' : 'store' },
      to: 1,
      mode: '=',
    },
  }),
  checkRef({ expression: { from, to } = {} }, nodeIds) {
    return checkOperandRef(from, nodeIds) || checkOperandRef(to, nodeIds);
  },
  checkError({ expression: { from, to } = {} }) {
    const state = store.getState().project;
    return checkOperandError(from, state) || checkOperandError(to, state) || '';
  },
  Summary({ props: { time, expression = {} } }) {
    return (
      <>
        {delay(time)}
        <ExpressionSummary expression={expression} keys={['from', 'mode', 'to']} operator="mode" />
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
          index: 'expression',
          content(value, onChange) {
            const variables = useVariable();
            const keys = getExpressionKeys(value, variables);
            const { enableBlueprint } = useEditor(0, 'enableBlueprint');
            return expressionSpark(value, onChange, keys, 'mode', (options, _operator, key) =>
              key === 'from'
                ? options.filter(opt => (enableBlueprint ? opt.value === 'scene' : opt.value === 'store'))
                : enableBlueprint
                ? options.filter(opt => opt.value !== 'store')
                : options.filter(opt => opt.value !== 'scene')
            );
          },
        },
        {
          spark: 'element',
          content() {
            const { trigger } = useEventBus('RikoLog');
            const { enableBlueprint } = useEditor(0, 'enableBlueprint');

            return !enableBlueprint ? (
              <Button block icon={<GlobalOutlined />} onClick={() => trigger('globalVar')}>
                全局变量
              </Button>
            ) : null;
          },
        },
      ],
    },
  },
};
