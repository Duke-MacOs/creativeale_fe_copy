import { useEditor } from '@editor/aStore';
import { createCustomSignal, newSignalIndex } from '@editor/Editor/Blueprint/utils';
import render from '@editor/Editor/Property/cells';
import { ArrayCell } from '@editor/Editor/Property/cells/views/ArrayCell';
import { useVariable } from '@editor/Editor/Property/spark/common/storeSelectSpark';
import { IEventDesc } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { expressionSpark } from '@editor/Editor/Property/spark/layouts/Script/Event/components/expression';
import { getExpressionKeys } from '@editor/Editor/Property/spark/layouts/Script/Event/components/operand';

export const Switch: IEventDesc = {
  name: '条件判断',
  category: '逻辑修改',
  content: {
    spark: 'group',
    label: '分支判断',
    content: {
      spark: 'value',
      index: 'editor',
      content(editor: RikoScript['editor'] = {}, onChangeEditor) {
        const { outputs = [] } = editor;
        return {
          spark: 'value',
          index: 'switch',
          content(switchList: Array<{ case: string; conditions: any[] }> = [], onChangeProps) {
            if (outputs.length !== switchList.length + 1) {
              throw new Error(`数据异常 ${outputs} ${switchList}`);
            }

            return {
              spark: 'element',
              content() {
                const defaultSignal = outputs.find(output => output.key === '0'); // 默认分支
                const restSignals = outputs.filter(output => output.key !== '0');
                const items = restSignals.map((output, index) => [output, switchList[index]] as const);
                return (
                  <ArrayCell
                    label="分支"
                    array={items}
                    defaultItem={onAdd => {
                      const newKey = newSignalIndex(items.map(([output]) => output));
                      onAdd([
                        {
                          key: createCustomSignal(`$outputs`, newKey),
                          label: `分支 ${newKey}`,
                        },
                        {
                          case: createCustomSignal(`$outputs`, newKey),
                          conditions: [],
                        },
                      ]);
                    }}
                    onChange={newValue => {
                      const outputs = newValue.map(([output]) => output);
                      const switchList = newValue.map(([_, switchExp]) => switchExp);
                      onChangeEditor({ ...editor, outputs: [...outputs, defaultSignal] });
                      onChangeProps(switchList);
                    }}
                    render={([output, switchExp], onChange) => {
                      return render({
                        spark: 'grid',
                        content: [
                          {
                            spark: 'element',
                            content(render) {
                              return render({
                                spark: 'string',
                                value: output.label,
                                label: '分支名',
                                onChange(label) {
                                  if (typeof label === 'string') {
                                    onChange([{ ...output, label }, switchExp]);
                                  }
                                },
                              });
                            },
                          },
                          {
                            spark: 'element',
                            content() {
                              const variables = useVariable();
                              const { enableBlueprint } = useEditor(0, 'enableBlueprint');

                              return (
                                <ArrayCell
                                  label="条件判断"
                                  array={switchExp.conditions}
                                  defaultItem={{
                                    from: { ids: [-1], key: 'alpha', type: 'node' },
                                    compare: '=',
                                    to: 1,
                                  }}
                                  onChange={newConditions => {
                                    onChange([output, { ...switchExp, conditions: newConditions }]);
                                  }}
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
                          },
                        ],
                      });
                    }}
                  />
                );
              },
            };
          },
        };
      },
    },
  },
};
