import { DeleteOutlined } from '@ant-design/icons';
import { useEditor } from '@editor/aStore';
import { OpenKeysEnabled } from '@editor/Editor/Property/spark/layouts/groups';
import { enabledSpark } from '@editor/Editor/Property/spark/layouts/groups/headerGroup/enabledSpark';
import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { Button, Tooltip } from 'antd';
import { css } from 'emotion';
import { useMemo } from 'react';
import render, {
  collectIndices,
  getIndexer,
  IContext,
  NULL_SPARK,
  Spark,
  updateIndices,
} from '../../../../Property/cells';
import { scriptGroup, SCRIPTS } from '../../../../Property/spark/layouts/Script/Scripts';
import { useBPContext, useScriptModel } from '../../../hooks';
import * as Blueprint from './eventGroups';

export function PropsGroup() {
  const props = useBPContext()!;
  const { script: value, onChange } = useScriptModel(props);
  const { propsMode } = useEditor(0, 'propsMode');

  const group = usePropsGroup(value!, onChange);

  return useMemo(() => render(group), [value, propsMode]);
}
export function usePropsGroup(
  script: RikoScript,
  onChange: (script: Partial<RikoScript>, options: any) => void
): Spark {
  const content =
    (SCRIPTS[script.props.script as keyof typeof SCRIPTS]
      ? overrideGroupSpark(scriptGroup({} as any, {} as any), '触发方式')
      : script.type === 'Effect'
      ? EVENTS['Effect'].content
      : EVENTS[script.props.script as keyof typeof EVENTS]?.content &&
        overrideGroupSpark(
          EVENTS[script.props.script as keyof typeof EVENTS]?.content ?? NULL_SPARK,
          script.props.script === 'ModifyData' ? '赋值' : EVENTS[script.props.script as keyof typeof EVENTS]?.name
        )) ??
    Blueprint[script.props.script as keyof typeof Blueprint]?.content ??
    NULL_SPARK;

  const openKeys = useOpenKeys(script, onChange, content);

  return {
    spark: 'context',
    provide: () => ({
      useValue: index => {
        const { indexValue, indexEntries } = getIndexer(index);
        if (index in script) {
          return {
            value: [indexValue(script ?? {})],
            onChange([value]: any, options) {
              onChange({ [index as keyof RikoScript]: value }, options);
            },
          };
        }
        return {
          value: [indexValue(script.props ?? {})],
          onChange([value]: any, options) {
            if (options?.replace) {
              onChange({ props: value }, options);
            } else {
              onChange({ props: { ...script.props, ...Object.fromEntries(indexEntries(value)) } }, options);
            }
          },
        };
      },
      blueprint: {
        enabled: true,
      },
      openKeys,
    }),
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'check',
          index: '',
          check: {
            hidden: () => {
              const { propsMode } = useEditor(0, 'propsMode');
              return propsMode !== 'Template';
            },
          },
          content: {
            spark: 'element',
            content() {
              return <OpenKeysEnabled className={css({ height: 40, padding: '16px 16px 0' })} />;
            },
          },
        },
        {
          spark: 'group',
          label: '图块信息',
          content: {
            spark: 'value',
            index: 'name',
            content(name) {
              return {
                spark: 'value',
                index: '_editor',
                content(_editor = {}, onChange) {
                  const { bpName } = _editor;
                  return {
                    spark: 'element',
                    content(render) {
                      return render({
                        spark: 'string',
                        value: bpName ?? name ?? '',
                        onChange(bpName) {
                          onChange({ ..._editor, bpName });
                        },
                        tooltip: '名称',
                        label: '名称',
                      });
                    },
                  };
                },
              };
            },
          },
          extra: blueprintGroupExtra,
        },
        content,
      ],
    },
  };
}

const useOpenKeys = (
  script: RikoScript,
  onChange: (script: Partial<RikoScript>, options?: any) => void,
  content: Spark
): IContext['openKeys'] => {
  const { propsMode } = useEditor(0, 'propsMode');
  if (propsMode !== 'Template') {
    return {};
  }

  const { editor: { enabled = false, openKeys = [] } = {} } = script;

  return {
    checking: true,
    enabled,
    setEnabled(enabled) {
      onChange({ ...script, editor: { ...script.editor, enabled } });
    },
    openKeys,
    setOpenKeys: (checked: boolean, slice: any[]) => {
      onChange({
        ...script,
        editor: {
          ...script.editor,
          openKeys: updateIndices(
            openKeys ?? collectIndices(content, ['required', 'recommended']),
            checked,
            slice
          ) as string[],
        },
      });
    },
  };
};

function overrideGroupSpark(spark: Spark, label: React.ReactNode): Spark {
  if (spark.spark === 'group') {
    return {
      ...spark,
      label,
      extra: undefined,
    };
  }
  return spark;
}

export const blueprintGroupExtra: Spark = {
  spark: 'flex',
  columnGap: 0,
  content: [
    enabledSpark(),
    {
      spark: 'value',
      index: 'id',
      content(id) {
        return {
          spark: 'element',
          content: () => {
            const { removeNodes } = useBPContext()!;
            return useMemo(
              () => (
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      removeNodes([String(id)]);
                    }}
                  />
                </Tooltip>
              ),
              // eslint-disable-next-line react-hooks/exhaustive-deps
              [id, removeNodes]
            );
          },
        };
      },
    },
  ],
};
