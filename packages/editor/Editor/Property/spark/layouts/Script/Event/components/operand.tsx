import { NodeCell, useCurrentNodeId, useNodeOptions } from '../../../groups/customGroups/NodeCell';
import { usePropOptions, valueLabelMap } from '@editor/Editor/Property/spark/common/propSelectSpark';
import { ResourceBox } from '../../../groups/resourceSpark/ResourceBox';
import { useStoreOptions } from '../../../../common/storeSelectSpark';
import { expressionSpark, ExpressionSummary } from './expression';
import render, { ArrayCell, callValue, Spark } from '@editor/Editor/Property/cells';
import { operatorSpark } from './operator';
import { getScene, neverThrow } from '@editor/utils';
import { useStore } from 'react-redux';
import { Fragment } from 'react';
import { Tooltip, Typography } from 'antd';
import { useSymbols } from '@editor/Editor/Blueprint/hooks/useSymbols';

export type IOperand =
  | number
  | boolean
  | string
  | Array<IOperand>
  | {
      type: 'node';
      ids: number[];
      key?: string;
    }
  | {
      type: 'res';
      url?: string;
      _editor?: Record<string, any>;
    }
  | {
      type: 'store';
      key?: string;
    }
  | {
      type: 'mouse';
      key: 'x' | 'y';
      isLocal: boolean;
    }
  | { type: 'event'; key?: string } // @deprecated
  | { type: 'func'; source: IOperand; key: string; value: IOperand }
  | { type: 'scene'; key: string }; // 场景数值 useSymbol

export const OperandSummary = ({ value, depth = 0 }: { value: IOperand; depth?: number }) => {
  const nodeOptions = useNodeOptions();
  switch (typeof value) {
    case 'number':
    case 'string':
    case 'boolean':
      return <>{JSON.stringify(value)}</>;
    case 'object': {
      if (Array.isArray(value)) {
        return (
          <>
            [
            {value.map((value, index) => (
              <Fragment key={index}>
                {index === 0 ? '' : ', '}
                <OperandSummary value={value} />
              </Fragment>
            ))}
            ]
          </>
        );
      }
      switch (value.type) {
        case 'event': {
          return <>事件对象的${value.key}</>;
        }
        case 'node': {
          const node = nodeOptions.find(item => item.value === (value.ids?.[0] ?? -1));
          return (
            <>
              {node?.label || '素材节点'}的{valueLabelMap[value.key as keyof typeof valueLabelMap] ?? '?'}
            </>
          );
        }
        case 'store': {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{value.key || '?'}</>;
        }
        case 'func': {
          return (
            <ExpressionSummary depth={depth + 1} expression={value} keys={getFuncKeys(value.key)} operator="key" />
          );
        }
        case 'res': {
          const { _editor: { name } = { name: '' } } = value;
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{name || '?'}</>;
        }
        case 'mouse': {
          const { key = 'x' } = value;
          return <>鼠标{key === 'x' ? '横坐标' : '纵坐标'}</>;
        }

        case 'scene': {
          // eslint-disable-next-line react/jsx-no-useless-fragment
          return <>{value.key}</>;
        }
        default:
          return neverThrow(value);
      }
    }
  }
};

export const operandSpark = (
  value: IOperand,
  onChange: (value: any, options?: any) => void,
  filterOperandType?: (options: typeof allOptions) => typeof allOptions
): Spark => {
  switch (typeof value) {
    case 'boolean':
      return {
        spark: 'grid',
        content: [
          typeSpark(value, onChange, filterOperandType),
          simpleSpark(typeof value, onChange),
          {
            spark: 'label',
            label: '值',
            content: {
              spark: 'element',
              content: render => render({ spark: typeof value as 'boolean', value, onChange }),
            },
          },
        ],
      };
    case 'number':
    case 'string':
      return {
        spark: 'grid',
        content: [
          typeSpark(value, onChange, filterOperandType),
          simpleSpark(typeof value, onChange),
          {
            spark: 'element',
            content: render =>
              render({
                spark: typeof value as any,
                value,
                onChange(newValue: any, options: any) {
                  onChange(callValue(newValue, value), options);
                },
                label: '值',
              }),
          },
        ],
      };
    case 'object':
      if (Array.isArray(value)) {
        return {
          spark: 'grid',
          content: [
            typeSpark(value, onChange, filterOperandType),
            simpleSpark('array', onChange),
            {
              spark: 'label',
              content: {
                spark: 'element',
                content: () => (
                  <ArrayCell
                    label="值"
                    array={value}
                    defaultItem={0}
                    onChange={onChange}
                    render={(value, onChange) => render(operandSpark(value ?? 0, onChange))}
                  />
                ),
              },
            },
          ],
        };
      }
      switch (value.type) {
        case 'node':
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              {
                spark: 'element',
                content: () => (
                  <NodeCell
                    value={value.ids?.[0]}
                    label="素材节点"
                    onChange={id => onChange({ ...value, ids: [id] })}
                  />
                ),
              },
              {
                spark: 'element',
                space: 'node',
                content: render => {
                  const currentNodeId = useCurrentNodeId();
                  const { getState } = useStore<EditorState>();
                  const scene = getScene(getState().project);
                  const { props } = scene;
                  const parentId: number = value?.ids?.[0] || currentNodeId;
                  const { compProps = [] } = props[parentId] || {};
                  const compPropsOptions = compProps
                    .filter(({ type }) => !type.startsWith('Script_'))
                    .reduce<Array<{ value: string; label: string; ids: number[]; key: string }>>(
                      (options, { props, ids, name }) => [
                        ...options,
                        ...props.map(({ key }) => ({
                          value: `${key}:${ids.join(':')}`,
                          label: `${name}的${key}`,
                          key,
                          ids,
                        })),
                      ],
                      []
                    );

                  const PROP_OPTIONS = usePropOptions({ targetId: parentId });
                  return render({
                    spark: 'select',
                    value: value.ids?.length > 1 ? `${value.key}:${value.ids.slice(1).join(':')}` : value.key,
                    label: '素材属性',
                    onChange(key) {
                      const target = compPropsOptions.find(opt => opt.value === key);
                      if (target) {
                        const { ids, key } = target;
                        const parentId = value.ids[0];
                        onChange({ ...value, key, ids: [parentId, ...ids] });
                      } else {
                        const parentId = value.ids[0];
                        onChange({ ...value, key, ids: [parentId] });
                      }
                    },
                    options: [...compPropsOptions, ...PROP_OPTIONS],
                  });
                },
              },
            ],
          };
        case 'res':
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              {
                spark: 'element',
                content: () => (
                  <ResourceBox
                    deletable
                    type="Sprite"
                    url={value.url}
                    name={value._editor?.name}
                    onChange={({ url, name }) => {
                      onChange({ ...value, url, _editor: { ...value._editor, name } });
                    }}
                  />
                ),
              },
            ],
          };
        case 'store':
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              {
                spark: 'element',
                space: 'store',
                content: render => {
                  const options = useStoreOptions();
                  return render({
                    spark: 'select',
                    value: value.key,
                    label: '变量名',
                    options,
                    onChange(key) {
                      onChange({ ...value, key });
                    },
                  });
                },
              },
            ],
          };
        case 'func':
          const keys = getFuncKeys(value.key);
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              keys.length > 1
                ? expressionSpark(value, onChange, keys, 'key', filterOperandType)
                : operatorSpark(value.key, (key, options) => onChange({ ...value, key }, options), 'key'),
            ],
          };
        case 'event':
          return {
            spark: 'grid',
            content: [typeSpark(value, onChange, filterOperandType)],
          };
        case 'mouse':
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              {
                spark: 'element',
                content(render) {
                  return render({
                    spark: 'select',
                    label: '坐标',
                    options: [
                      {
                        value: 'x',
                        label: '水平坐标',
                      },
                      {
                        value: 'y',
                        label: '垂直坐标',
                      },
                    ],
                    value: value.key || 'x',
                    onChange(key, options) {
                      onChange({ ...value, key }, options);
                    },
                  });
                },
              },
              {
                spark: 'element',
                content(render) {
                  return render({
                    spark: 'boolean',
                    children: (
                      <Tooltip title="局部坐标表示鼠标相对于父对象的偏移量，否则相对于场景" placement="top">
                        <Typography.Text type="secondary">是否为局部坐标</Typography.Text>
                      </Tooltip>
                    ),
                    value: value.isLocal ?? true,
                    onChange(isLocal, options) {
                      onChange({ ...value, isLocal }, options);
                    },
                  });
                },
              },
            ],
          };
        case 'scene': {
          return {
            spark: 'grid',
            content: [
              typeSpark(value, onChange, filterOperandType),
              {
                spark: 'element',
                content(render) {
                  const options = useSymbols();
                  return render({
                    spark: 'select',
                    label: '场景数值',
                    options,
                    value: value.key,
                    onChange(newValue, options) {
                      onChange({ ...value, key: newValue }, options);
                    },
                  });
                },
              },
            ],
          };
        }
        default:
          return neverThrow(value);
        // return {
        //   spark: 'grid',
        //   content: [typeSpark(value, onChange, filterOperandType)],
        // };
      }
    default:
      return {
        spark: 'grid',
        content: [typeSpark(value, onChange, filterOperandType)],
      };
  }
};

export const getFuncKeys = (operator: string) => {
  switch (operator) {
    case 'array.length':
    case 'math.round':
    case 'math.floor':
    case 'array.pop':
    case 'math.ceil':
    case 'math.sin':
    case 'math.cos':
      return ['source', 'key'];
    case 'math.fixed':
    case 'array.push':
      return ['key', 'source', 'value'];
    case 'math.random':
    case 'math.min':
    case 'math.max':
      return ['source', 'value', 'key'];
    case 'array.get':
    case 'object.get':
      return ['source', 'key', 'index'];
    case 'math.now':
      return ['key'];
    case 'array.update':
    case 'array.insert':
      return ['source', 'index', 'key', 'value'];
    case 'array.delete':
      return ['source', 'index', 'key', 'len'];
    default:
      return ['source', 'key', 'value'];
  }
};

export const getExpressionKeys = (expression: Record<string, any>, variables?: Record<string, any>) => {
  const { from, mode, compare } = expression;
  if (compare) {
    return ['from', 'compare', 'to'];
  }
  if (mode) {
    if (from?.type === 'store' && from.key) {
      const variable = variables?.[from.key];

      if (Array.isArray(variable)) {
        switch (mode) {
          case 'array.insert':
          case 'array.update':
            return ['from', 'index', 'mode', 'to'];
          case 'array.delete':
            return ['from', 'index', 'mode'];
          case 'array.clear':
            return ['from', 'mode'];
          default:
            return ['from', 'index', 'mode', 'to'];
        }
      } else if (typeof variable === 'object' && variable !== null) {
        switch (mode) {
          case 'object.update':
            return ['from', 'index', 'mode', 'to'];
          case 'object.delete':
            return ['from', 'index', 'mode'];
          case 'object.clear':
            return ['from', 'mode'];
          default:
            return ['from', 'index', 'mode', 'to'];
        }
      }
    }
  }
  return ['from', 'mode', 'to'];
};

const allOptions: Array<{
  label: string;
  value: Exclude<Exclude<IOperand, string | number | boolean | Array<IOperand>>['type'], 'event'> | 'simple';
}> = [
  {
    label: '固定数值',
    value: 'simple',
  },
  {
    label: '节点属性',
    value: 'node',
  },
  {
    label: '场景数值',
    value: 'scene',
  },
  {
    label: '全局变量',
    value: 'store',
  },
  {
    label: '计算数据',
    value: 'func',
  },
  {
    label: '鼠标位置',
    value: 'mouse',
  },
  {
    label: '素材资源',
    value: 'res',
  },
];

const typeSpark = (
  value: IOperand,
  onChange: any,
  filterOperandType?: (options: typeof allOptions) => typeof allOptions
): Spark => {
  const options = filterOperandType?.(allOptions) ?? allOptions;
  return {
    spark: 'element',
    hidden: options.length === 1,
    content: render =>
      render({
        spark: 'select',
        label: '数据类型',
        value:
          typeof value === 'object' && !Array.isArray(value)
            ? options.find(option => option.value === value?.type)?.value
            : 'simple',
        options,
        onChange(type) {
          switch (type) {
            case 'simple':
              return onChange(0);
            case 'node':
              return onChange({ type, ids: [-1] });
            case 'func':
              return onChange({ type, key: 'math.plus', source: 0, value: 0 });
            case 'mouse':
              return onChange({ type, key: 'x', isLocal: true });
            case 'scene':
              return onChange({ type, value: '' });
            default:
              return onChange({ type });
          }
        },
      }),
  };
};

const simpleSpark = (value: any, onChange: any): Spark => {
  return {
    spark: 'element',
    content: render =>
      render({
        spark: 'select',
        label: '数值类型',
        options: [
          {
            label: '数字',
            value: 'number',
          },
          {
            label: '字符',
            value: 'string',
          },
          {
            label: '布尔',
            value: 'boolean',
          },
          {
            label: '数组',
            value: 'array',
          },
        ],
        value,
        onChange(value) {
          switch (value) {
            case 'number':
              return onChange(0);
            case 'string':
              return onChange('');
            case 'boolean':
              return onChange(false);
            case 'array':
              return onChange([]);
          }
        },
      }),
  };
};
