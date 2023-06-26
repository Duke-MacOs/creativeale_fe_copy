import { createNode, INodeData } from '@byted/riko';
import render, {
  labelBooleanSpark,
  callValue,
  filterSpark,
  IGroupSpark,
  neverThrow,
  NULL_SPARK,
  Spark,
  ArrayCell,
  getIndexer,
} from '@editor/Editor/Property/cells';
import { CubicBezierEle } from '../../Effect/groups/loopGroup/CubicBezierEle';
import { getScene, newID, RikoHook, intoRikoHook, getSceneByOrderId } from '@editor/utils';
import { get, isFunction, isPlainObject, pick } from 'lodash';
import { ResourceBox } from '../resourceSpark/ResourceBox';
import { EventList } from '../../Script/Event/EventList';
import { useEffect, useRef, useState } from 'react';
import store, { ICaseState, useEditor } from '@editor/aStore';
import { useSelector, useStore } from 'react-redux';
import { EffectCell } from './EffectCell';
import { NodeCell } from './NodeCell';
import { ResourceChanger } from '../resourceSpark/ResourceBox/Actions';
import Axios from 'axios';
import { absoluteUrl } from '@shared/utils';
import { Vector } from './vector';
import { TextBox } from './TextBox';
import { css, keyframes } from 'emotion';
import { scaleX_SPARK, scaleY_SPARK, x_SPARK, y_SPARK } from '../../Script/Event';
import { widthHeightSpark } from '../transformGroup/widthHeightSpark';
import { useForceSceneReload } from '@editor/Preview';
import { useSymbols } from '@editor/Editor/Blueprint/hooks/useSymbols';
import { MaterialSelect } from '../../3D/Materials';
import { ExtraSignals } from './ExtraSignals';

export function customGroups(
  hook: Pick<RikoHook, 'name' | 'tooltip' | 'default' | 'value' | 'callee'>,
  onChange: (key: string, value: any, options?: any) => void,
  vars?: any
): Array<Spark> {
  const { callee, name, default: d, value = d, tooltip } = hook;
  vars = vars ?? valueFromHook(hook as any);
  function* generate(): Generator<Spark> {
    const entries = Object.entries(value as Record<string, RikoHook>).sort(
      (e1, e2) => e1[1].orderIndex - e2[1].orderIndex
    );
    const singles = entries.filter(item => !['Riko.useArray', 'Riko.useObject'].includes(item[1].callee));
    if (singles.length) {
      const group = hooksToGroup(onChange, singles, name, tooltip, vars);
      if (callee == 'object' && group.spark == 'group') {
        yield group.content;
      } else {
        yield group;
      }
    }
    for (const [key, value] of entries) {
      if (isHidden(vars, value.hidden)) {
        continue;
      }
      if (value.callee === 'Riko.useArray') {
        yield hooksToGroup(onChange, [[key, value]], value.name, value.tooltip, vars);
      } else if (value.callee === 'Riko.useObject') {
        for (const spark of customGroups(
          value,
          (k, v) => {
            onChange(key, { ...value, value: { ...value.value, [k]: v } });
          },
          vars
        )) {
          if (spark.spark === 'group') {
            yield {
              ...spark,
              content: {
                spark: 'block',
                indices: [key],
                content: spark.content,
              },
            };
          } else {
            yield {
              spark: 'block',
              indices: [key],
              content: spark,
            };
          }
        }
      }
    }
  }
  const result = Array.from(generate()).filter(content => content !== NULL_SPARK);
  return result.length > 0 ? result : [NULL_SPARK];
}

const hooksToGroup = (
  onChange: (key: string, value: any, options?: any) => void,
  hooks: [string, RikoHook][],
  label: string,
  tooltip: string | undefined,
  vars: any
): IGroupSpark | typeof NULL_SPARK =>
  filterSpark({
    spark: 'group',
    label,
    tooltip,
    content: {
      spark: 'grid',
      content: hooks.map(([key, hook]) => ({
        spark: 'block',
        indices: [key],
        cols: hook.colSpan && Math.floor(hook.colSpan / 4),
        content: hookToSpark(
          key,
          hook,
          (value: any, options: any) => {
            onChange(key, isFunction(value) ? value(hook) : { ...hook, value }, options);
          },
          vars
        ),
      })),
    },
  });

const isHidden = (vars: any, hidden?: boolean | string) => {
  if (typeof hidden === 'string') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const i = vars?._index ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const $ = new Proxy(vars, {
        get(vars, p) {
          return get(vars, '$' + (p as any));
        },
      });
      return eval(hidden.slice('eval:'.length));
    } catch {}
  }
  return hidden;
};

export const hookToSpark = (
  key: string,
  {
    callee,
    min,
    max,
    unit,
    step,
    type,
    ratio,
    cover,
    tooltip,
    options,
    precision,
    defaultItem,
    required,
    defaultExpanded = true,
    minLength,
    maxLength,
    placeholder,
    name: label = key,
    default: defaultValue,
    value = defaultValue,
    concise,
    hidden,
    desc,
    accept,
    labels,
    width,
    _editor,
    ...rest
  }: RikoHook,
  onChange: any,
  vars: any
): Spark => {
  if (isHidden(vars, hidden)) {
    return NULL_SPARK;
  }
  label = label.replace(/^\$/g, '');
  switch (callee) {
    case 'Riko.useSlider':
    case 'Riko.useNumber':
    case 'number':
      return {
        spark: 'element',
        space: callee,
        content: () => {
          const addonAfter = useSelector(({ project }: EditorState) => {
            if (!(rest as any).tempSolution) {
              return undefined;
            }
            const scene = getScene(project);
            const { props } = scene;
            const { [scene.id]: _sceneProps, ...restProps } = props;
            const results = Array.from(findSameKey(restProps, key));
            const count = results.reduce((count, value) => {
              return count + (value ?? 0);
            }, 0);
            const newPercent = ((Number(value) / count) * 100).toFixed(1);
            const addonAfter = `抽中概率：${newPercent}%`;
            return addonAfter;
          });

          return render({
            spark: 'flex',
            content: [
              {
                spark: 'element',
                space: callee,
                content(render) {
                  return render({
                    spark: callee === 'Riko.useSlider' ? 'slider' : 'number',
                    label,
                    min,
                    max,
                    step,
                    unit,
                    ratio,
                    value,
                    width,
                    precision,
                    required,
                    tooltip,
                    placeholder,
                    onChange(valueOrFn: any, options: any) {
                      onChange(callValue(valueOrFn, value), options);
                    },
                    inputNumber: true,
                  });
                },
              },
              {
                spark: 'element',
                space: callee,
                hidden: !addonAfter,
                content() {
                  return <div>{addonAfter}</div>;
                },
              },
            ],
          });
        },
      };
    case 'Riko.useSymbol': {
      return {
        spark: 'element',
        space: callee,
        content: render => {
          const options = useSymbols();
          return render({
            spark: 'select',
            value,
            width,
            onChange,
            options,
            required,
            label,
            tooltip,
            placeholder,
            input: true,
          });
        },
      };
    }
    case 'Riko.useString':
    case 'Riko.useColor':
    case 'string':
      return {
        spark: 'element',
        space: callee,
        content: render =>
          render({
            spark: callee === 'Riko.useColor' ? 'color' : 'string',
            label,
            max,
            accept,
            value,
            type,
            required,
            width,
            tooltip,
            placeholder,
            onChange,
            ...((callee === 'Riko.useString' && type ? { type } : {}) as any),
          }),
      };
    case 'Riko.useBoolean':
    case 'boolean':
      return labelBooleanSpark({ spark: 'label', label, tooltip, required, value, onChange });
    case 'Riko.useSelect':
    case 'Riko.useMode':
      return {
        spark: 'element',
        space: callee,
        content: render =>
          render({
            spark: 'select',
            label,
            width,
            value,
            required,
            tooltip,
            options,
            placeholder,
            onChange,
          }),
      };
    case 'Riko.useRes':
      return {
        spark: 'element',
        space: callee,
        content: () => {
          const { getState } = useStore();
          return (
            <ResourceBox
              deletable
              type={typeAlias(type || 'Sprite')}
              url={value}
              label={label}
              required={required}
              name={_editor?.name || label}
              cover={_editor?.cover ?? cover}
              concise={concise ?? !['Sound', 'Sprite', 'Video'].includes(typeAlias(type || 'Sprite'))}
              onChange={async ({ url, name, cover }) => {
                let value = url;
                if (type === 'Cubemap' && url) {
                  const data = await handleCubeMap(url, getState().project);
                  value = data?.props?.textureCube;
                }
                onChange(({ cover: _, ...hook }: any) => ({
                  ...hook,
                  value,
                  _editor: { ..._editor, name, cover },
                }));
              }}
            />
          );
        },
      };
    case 'Riko.useResNode': {
      const { type: projectType } = store.getState().project;

      return {
        spark: 'element',
        space: callee,
        content: () => {
          const loadScene = useForceSceneReload();
          const ref = useRef<HTMLElement>();
          const { selectedInnerNode } = useEditor('selectedInnerNode');
          const selected = value?.id && value.id === selectedInnerNode?.[0];

          useEffect(() => {
            const element = ref.current;
            let timer: NodeJS.Timer;
            const animation = css({
              animation: `${keyframes`
                from {
                  background: transparent;
                  box-shadow: none;
                }
                50% {
                  background: rgb(238, 243, 254);
                  box-shadow: 0 0 0 2px rgb(57 85 246 / 30%);
                }
                to {
                  background: transparent;
                  box-shadow: none;
                }
              `} 1.2s 0.5s`,
            });
            if (selected) {
              timer = setTimeout(() => {
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element?.classList.add(animation);
              }, 300);
            }
            return () => {
              clearTimeout(timer);
              element?.classList.remove(animation);
            };
          }, [selected]);

          if (rest.isAnchor && projectType === 'Project') {
            // useResNode通过isAnchor属性变成锚点，在使用组件时隐藏图片画板
            return <div ref={ref as any} />;
          }
          if (type === 'Text') {
            return (
              <TextBox
                value={value}
                onChange={async (newValue: any) => {
                  onChange((hook: any) => ({ ...hook, value: { ...newValue, id: newID() } }));
                }}
              />
            );
          }
          return (
            <>
              <div className={css({ marginBottom: 10 })}>
                <ResourceBox
                  deletable
                  name={label}
                  domRef={ref}
                  required={required}
                  url={value?.props?.url}
                  cover={_editor?.cover ?? cover}
                  type={typeAlias(type || 'Sprite')}
                  concise={concise ?? !['Sound', 'Sprite', 'Video'].includes(typeAlias(type || 'Sprite'))}
                  onChange={async ({ url, name, cover }) => {
                    if (url) {
                      const newValue = await createNode(name!, typeAlias(type || 'Sprite'), newID, url!);
                      onChange((hook: any) => ({
                        ...hook,
                        _editor: { ..._editor, cover },
                        value: {
                          ...newValue,
                          props: { ...newValue.props, ...pick(value?.props, ['x', 'y']) },
                          editor: {
                            ...newValue.editor,
                            cover,
                            ...(rest.isAnchor && { editableProperties: ['x', 'y'] }),
                          },
                          id: newID(),
                        },
                        name,
                      }));
                    } else {
                      // 删除节点
                      onChange((hook: any) => ({
                        ...hook,
                        value: undefined,
                        _editor: undefined,
                        name: undefined,
                      }));
                      loadScene();
                    }
                  }}
                />
              </div>
              {value &&
                render(
                  getUseResNodeGroup(value, newValue => {
                    onChange((hook: any) => ({
                      ...hook,
                      _editor: { ..._editor, cover },
                      value: { ...newValue, id: newID() },
                    }));
                  })
                )}
            </>
          );
        },
      };
    }
    case 'Riko.useEase':
      return {
        spark: 'element',
        space: callee,
        content: () => <CubicBezierEle label={label} value={value} onChange={onChange} />,
      };
    case 'Riko.useObject':
    case 'object':
      return filterSpark({
        spark: 'grid',
        content: customGroups(
          { callee, name: label, default: value, tooltip },
          (key, value, options) => {
            onChange((hook: any) => ({ ...hook, value: { ...(hook.value ?? hook.default), [key]: value } }), options);
          },
          vars
        ),
      });
    case 'Riko.useArray':
      return hookToSpark(key, defaultItem!, onChange, vars) !== NULL_SPARK
        ? {
            spark: 'element',
            space: `${callee}-${defaultItemToKey(defaultItem!).join('-')}`,
            content: () => {
              const [d, setD] = useState(undefined);
              useEffect(() => {
                if (defaultItem) {
                  fromHook(defaultItem).then(d => setD(d));
                }
              }, []);

              const [visible, setVisible] = useState(false);
              const onAddRef = useRef<any>(null);
              const calleeRef = useRef(collectCallee(defaultItem!, ['Riko.useRes', 'Riko.useResNode']));

              const editorRef = useRef({
                index: value.length,
                _arrayEditor: {},
              });

              return (
                <>
                  <ArrayCell
                    array={value}
                    label={label}
                    onChange={(value, _options, oldIndex, newIndex) => {
                      onChange((hook: any) => {
                        let _arrayEditor: any[] = (hook?._editor?._arrayEditor || []).slice();

                        if (oldIndex !== undefined && newIndex !== undefined) {
                          // 调整位置
                          const oldItem = _arrayEditor[oldIndex];
                          const newItem = _arrayEditor[newIndex];
                          _arrayEditor[oldIndex] = newItem;
                          _arrayEditor[newIndex] = oldItem;
                        } else if (value.length < hook.value.length) {
                          // 删除元素
                          const index = hook.value.findIndex((item: any) => value.every(i => item !== i));
                          _arrayEditor = _arrayEditor.filter((_, i) => i !== index);
                        } else {
                          // 新增或替换元素
                          _arrayEditor[editorRef.current.index] = editorRef.current._arrayEditor;
                        }

                        editorRef.current = {
                          index: value.length,
                          _arrayEditor: {},
                        };

                        return {
                          ...hook,
                          value,
                          _editor: {
                            ...(hook._editor || {}),
                            _arrayEditor,
                          },
                        };
                      });
                    }}
                    minLength={minLength}
                    maxLength={maxLength}
                    defaultItem={onAdd => {
                      if (
                        calleeRef.current.length === 1 &&
                        calleeRef.current.every(item => item[2] !== 'Cubemap') &&
                        calleeRef.current[0]?.[0] !== 'point'
                      ) {
                        // 数组项内部只有一个资源（useRes or useResNode）时进行特殊处理
                        setVisible(true);
                        onAddRef.current = onAdd;
                      } else {
                        const lastItem = value[value.length - 1];

                        if (d && typeof d === 'object') {
                          return onAdd(
                            replaceNode(d!, (node, name) => {
                              if (!lastItem) {
                                return {
                                  ...node,
                                  id: newID(),
                                };
                              } else {
                                const lastNode = findNode(lastItem, name);
                                const {
                                  editor: { _editor },
                                } = node as any;
                                const { offsetX = 20, offsetY = 20 } = _editor || {};
                                const {
                                  props: { x = 0, y = 0 },
                                } = lastNode as any;
                                return {
                                  ...node,
                                  id: newID(),
                                  props: {
                                    ...node.props,
                                    x: value.length ? x + offsetX : 0,
                                    y: value.length ? y + offsetY : 0,
                                  },
                                };
                              }
                            })
                          );
                        }
                        return onAdd(d);
                      }
                    }}
                    render={(v, onChange, _index) => {
                      const index = value.indexOf(v);
                      const { _arrayEditor } = _editor || {};
                      let hook = intoRikoHook(defaultItem!, v);
                      if (_arrayEditor?.[index]) {
                        hook = intoRikoHook(hook, _arrayEditor[index], '_editor');
                      }
                      return render(
                        hookToSpark(
                          label,
                          hook,
                          async (valueOrFn: any, options: any) => {
                            if (isFunction(valueOrFn) && calleeRef.current.length) {
                              const [[key]] = calleeRef.current;
                              const { value: val, _editor } = valueOrFn(hook);
                              editorRef.current = {
                                index: value.indexOf(v),
                                _arrayEditor:
                                  key === 'defaultItem'
                                    ? _editor
                                    : Object.fromEntries(
                                        Object.entries(val).map(([key, value]: any) => [key, value._editor])
                                      ),
                              };
                            }
                            onChange(
                              await fromHook(isFunction(valueOrFn) ? valueOrFn(hook) : { ...hook, value: valueOrFn }),
                              options
                            );
                          },
                          { ...vars, _index }
                        )
                      );
                    }}
                    defaultExpanded={defaultExpanded}
                  />
                  {visible && (
                    <ResourceChanger
                      eleType={typeAlias(calleeRef.current[0]?.[2] || 'Sprite')}
                      onChange={async ({ url, name }) => {
                        const [[key, callee, type]] = calleeRef.current;
                        editorRef.current = {
                          index: value.length,
                          _arrayEditor:
                            key === 'defaultItem'
                              ? {
                                  cover: url,
                                  name,
                                }
                              : {
                                  [key]: {
                                    cover: url,
                                    name,
                                  },
                                },
                        };
                        const newNode =
                          callee === 'Riko.useResNode'
                            ? await createNode(name, typeAlias(type || 'Sprite') as any, newID, url as string)
                            : null;
                        const lastItem = value[value.length - 1];
                        const { offsetX = 20, offsetY = 20 } = _editor || {};
                        if (key === 'defaultItem') {
                          onAddRef.current?.(
                            callee === 'Riko.useRes'
                              ? url
                              : {
                                  ...newNode,
                                  props: {
                                    ...newNode!.props,
                                    x: lastItem ? lastItem?.props?.x + offsetX : 0,
                                    y: lastItem ? lastItem?.props?.y + offsetY : 0,
                                  },
                                }
                          );
                        } else {
                          onAddRef.current?.(
                            Object.fromEntries(
                              Object.entries(d!).map(([k, v]) => [
                                k,
                                k === key
                                  ? callee === 'Riko.useRes'
                                    ? url
                                    : {
                                        ...newNode,
                                        props: {
                                          ...newNode!.props,
                                          x: lastItem ? lastItem[k].props.x + 20 : 0,
                                          y: lastItem ? lastItem[k].props.y + 20 : 0,
                                        },
                                      }
                                  : v,
                              ])
                            )
                          );
                        }
                      }}
                      onClose={() => {
                        setVisible(false);
                      }}
                    />
                  )}
                </>
              );
            },
          }
        : NULL_SPARK;
    case 'Riko.useNode':
      return {
        spark: 'element',
        space: callee,
        content: () => (
          <NodeCell
            deletable
            isType={t => !type || t === type}
            value={value}
            label={label}
            tooltip={tooltip}
            onChange={onChange}
          />
        ),
      };
    case 'Riko.useEffect':
      return {
        spark: 'element',
        space: callee,
        content: () => <EffectCell value={value} label={label} tooltip={tooltip} onChange={onChange} />,
      };
    case 'Riko.useEvent':
      return {
        spark: 'element',
        space: callee,
        content: () => <EventList scripts={value} onChange={onChange} desc={desc} context="useEvent" />,
      };
    case 'Riko.useVector':
      return {
        spark: 'element',
        space: callee,
        content: () => (
          <Vector
            value={value}
            onChange={onChange}
            tooltip={tooltip}
            label={label}
            labels={labels}
            inputOptions={{
              min,
              max,
              precision,
              step,
              unit,
              ratio,
            }}
          />
        ),
      };
    case 'Riko.useMaterial':
      return {
        spark: 'element',
        space: callee,
        content: () => (
          <MaterialSelect type="" orderId={value} onChange={onChange} copyLoading={false} editable={false} />
        ),
      };
    case 'Riko.useInput':
      return NULL_SPARK;
    case 'Riko.useOutput':
      return NULL_SPARK;
    case 'Riko.useInputs':
    case 'Riko.useOutputs':
      return {
        spark: 'element',
        space: callee,
        content: () => <ExtraSignals value={value} onChange={onChange} label={label} />,
      };
    default:
      return neverThrow(callee);
  }
};

const typeAlias = (type: string): any => {
  switch (type) {
    case 'Image':
      return 'Sprite';
    case 'Component':
      return 'Animation';
    case 'Component3D':
      return 'Animation3D';
    case 'Cubemap':
      return 'Skybox';
    default:
      return type;
  }
};

const fromHook = async (hook: RikoHook): Promise<any> => {
  switch (hook.callee) {
    case 'Riko.useObject':
    case 'object':
      return Object.fromEntries(
        await Promise.all(
          Object.entries(hook.value ?? hook.default).map(async ([key, hook]) => [key, await fromHook(hook as RikoHook)])
        )
      );
    case 'Riko.useResNode':
      if (hook.default) {
        const node = await createNode(hook.name, typeAlias(hook.type || 'Sprite') as any, newID, hook.default);
        Object.assign(node.props!, { x: 0, y: 0 });
        Object.assign(node.editor!, {
          _editor: {
            offsetX: hook.offsetX,
            offsetY: hook.offsetY,
          },
        });
        // 特殊字段 isAnchor
        if ((hook as any).isAnchor) {
          Object.assign(node.editor!, {
            editableProperties: ['x', 'y'],
          });
        }
        return hook.value ?? node;
      }
      return hook.value;
    default:
      return hook.value ?? hook.default;
  }
};

const valueFromHook = (hook: RikoHook): any => {
  switch (hook.callee) {
    case 'Riko.useObject':
    case 'object':
      return Object.fromEntries(
        Object.entries(hook.value ?? hook.default).map(([key, hook]) => [key, valueFromHook(hook as RikoHook)])
      );
    default:
      return hook.value ?? hook.default;
  }
};

function replaceNode(target: Record<string, any>, replace: (node: INodeData, name: string) => INodeData): any {
  return Object.fromEntries(
    Object.entries(target).map(([key, value]) => {
      if (isPlainObject(value)) {
        if (value.type && value.id) {
          return [key, replace(value, key)];
        }
        return [key, replaceNode(value, replace)];
      }
      return [key, value];
    })
  );
}

function findNode(target: Record<string, any>, name: string): any {
  for (const [key, value] of Object.entries(target)) {
    if (Array.isArray(value)) {
      const node = findNode(value, name);
      if (node) {
        return node;
      }
    } else if (value && typeof value === 'object') {
      if (key === name) return value;
      const node = findNode(value, name);
      if (node) return node;
    }
  }
}

function* findSameKey(record: Record<string, any>, name: string): Generator<any> {
  const notAllowedKeys = ['undoStack', 'redoStack', 'default', 'defaultItem'];
  for (const [key, value] of Object.entries(record)) {
    if (!notAllowedKeys.includes(key)) {
      if (key === name) {
        yield value;
      }
      if (value && typeof value === 'object') {
        yield* findSameKey(value, name);
      }
    }
  }
}

/**
 * 当defaultItem内参数变化，重新创建useArray组件
 * @param defaultItem
 * @returns
 */
function defaultItemToKey(defaultItem: RikoHook) {
  const result: string[] = [];
  switch (defaultItem.callee) {
    case 'Riko.useObject':
    case 'object':
      for (const [_, { callee, type }] of Object.entries(defaultItem.value ?? defaultItem.default) as [string, any]) {
        result.push(`${callee}_${type}`);
      }
      break;
    default: {
      result.push(`default_${defaultItem.callee}_${defaultItem.type}`);
    }
  }
  return result;
}

function collectCallee<T extends RikoHook['callee']>(defaultItem: RikoHook, calleeArr: T[]): [string, T, string?][] {
  if (calleeArr.includes(defaultItem.callee as T)) {
    return [['defaultItem', defaultItem.callee as T, defaultItem.type]];
  }
  return [];
}

async function handleCubeMap(url: string | number, project: ICaseState) {
  if (typeof url === 'string') {
    const { data } = await Axios.get(absoluteUrl(url));
    return data;
  }
  const scene = getSceneByOrderId(project, url);

  return scene;
}

function getUseResNodeGroup(node: INodeData, onChange: (node: INodeData) => void): Spark {
  return {
    spark: 'context',
    provide: () => ({
      useValue(index) {
        const { indexValue, indexEntries } = getIndexer(index);

        return {
          value: [indexValue(node.props)],
          onChange([newValue]) {
            onChange({ ...node, props: { ...node.props, ...Object.fromEntries(indexEntries(newValue)) } });
          },
        };
      },
    }),
    content: {
      spark: 'grid',
      content: [
        { spark: 'flex', content: [x_SPARK, y_SPARK] },
        widthHeightSpark(),
        {
          spark: 'number',
          label: '旋转角度',
          step: 1,
          precision: 0,
          index: 'rotation',
          unit: '°',
        },
        { spark: 'flex', content: [scaleX_SPARK, scaleY_SPARK] },
      ],
    },
  };
}
