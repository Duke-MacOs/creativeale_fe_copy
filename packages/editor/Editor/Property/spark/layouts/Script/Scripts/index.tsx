import type { SparkFn } from '../..';
import { NULL_SPARK, Spark, sparkValue } from '../../../../cells';
import { enabledSpark } from '../../groups/headerGroup/enabledSpark';
import { DeleteOutlined } from '@ant-design/icons';
import { ScriptSelect } from '../common/ScriptSelect';
import { useEditor, useOnDelete } from '@editor/aStore';
import { Button, Tooltip } from 'antd';
import SCRIPTS from './exports';

export { SCRIPTS };
export * from '../common';

export const scriptGroup: SparkFn = (): Spark => {
  return {
    spark: 'group',
    label: '互动行为',
    extra: {
      spark: 'flex',
      columnGap: 0,
      content: [
        enabledSpark(),
        {
          spark: 'element',
          content: () => {
            const { onDelete } = useOnDelete();
            return (
              <Tooltip title="删除">
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => onDelete()} />
              </Tooltip>
            );
          },
        },
      ],
    },
    content: {
      spark: 'value',
      index: 'script',
      content(script) {
        const { content } = SCRIPTS[script as keyof typeof SCRIPTS];
        const { enableBlueprint: blueprint } = useEditor(0, 'enableBlueprint');

        return {
          spark: 'block',
          status: 'required',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'value',
                index: ['name', 'time', 'nodeId'],
                content([name, time, nodeId]: [string, number, number], onChange: any) {
                  return {
                    spark: 'value',
                    index: 'scripts',
                    content(scripts) {
                      return {
                        spark: 'element',
                        content() {
                          return (
                            <ScriptSelect
                              name={name}
                              time={time}
                              script={script}
                              onChange={({ name: n = name, time: t = time }) => {
                                onChange([n, t, nodeId]);
                              }}
                              onReplace={script => {
                                const { content, name } = SCRIPTS[script as keyof typeof SCRIPTS];
                                const props = sparkValue(content({ blueprint }));
                                onChange({ ...props, name, script, time, scripts, nodeId }, { replace: true });
                              }}
                            />
                          );
                        },
                      };
                    },
                  };
                },
              },
              {
                ...content({ blueprint }),
                hidden: content({ blueprint }) === NULL_SPARK,
              },
            ],
          },
        };
      },
    },
  };
};
