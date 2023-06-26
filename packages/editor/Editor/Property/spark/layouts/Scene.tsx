import type { SparkFn } from '.';
import Icon from '@ant-design/icons';
import { ICompProp, useOnPreview, useSelected } from '@editor/aStore';
import render, { CellContext, collectIndices, filterIndices, filterSpark, Spark } from '@editor/Editor/Property/cells';
import { typeSpark } from './groups/resourceSpark/typeSpark';
import { groupCompProps } from './groups/resourceSpark';
import { useContext, useEffect, useRef } from 'react';
import { customGroups } from './groups/customGroups';
import { extraSpark, headerGroup } from './groups';
import { EVENTS } from './Script/Event';
import { SCRIPTS } from './Script/Scripts';
import { Right } from '@icon-park/react';
import { useStore } from 'react-redux';
import { isEqual, pick } from 'lodash';
import { getUseValue } from '..';
import { Button } from 'antd';
import { css } from 'emotion';
import * as sparks from '.';

export const Scene: SparkFn = (props, envs) => {
  if (envs.propsMode !== 'Product') {
    return { spark: 'grid', content: [extraSpark, headerGroup].map(fn => fn(props, envs)) };
  }
  return {
    spark: 'value',
    index: 'compProps',
    space: 'scene.comProps',
    visit: true,
    content(compProps_: ICompProp[] = []) {
      const compProps = groupCompProps(compProps_);
      const store = useStore();
      const {
        visiting: { next = [], prev = [], onVisit },
      } = useContext(CellContext);
      const { onPreview } = useOnPreview();

      const compProp = compProps.find(({ ids: [id] }) => id === next[0]);
      const { selected, onSelect } = useSelected(compProp?.ids[0] ?? -1, true);
      useEffect(() => {
        if (compProp && !selected) {
          onSelect({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [selected, Boolean(compProp)]);
      const getCompPropUseValue = (compProp: ICompProp) => {
        return getUseValue([compProp.ids[0]], store, (key, props) => {
          if (key !== 'compProps') {
            const keys =
              compProps_
                .find(({ ids }) => ids[0] === compProp.ids[0] && ids.length === 1)
                ?.props.map(({ key }) => key) || [];
            keys.push('_editor', 'name');
            return pick(props, keys);
          }
          // 场景下互动组件的compProps过滤
          const { compProps = [] } = props;
          return {
            compProps: compProps_
              .filter(({ ids }) => ids[0] === compProp.ids[0] && ids.length > 1)
              .map(compProp => {
                const ids = compProp.ids.slice(1);
                const { props } = (compProps as ICompProp[]).find(compProp => isEqual(compProp.ids, ids))!;
                return {
                  ...compProp,
                  ids,
                  props: props.filter(({ key }) => compProp.props.some(prop => key === prop.key)),
                };
              }),
          };
        });
      };
      if (compProp) {
        return {
          spark: 'context',
          provide: () => ({
            useValue: getCompPropUseValue(compProp),
          }),
          content: {
            spark: 'visit',
            index: compProp.ids[0],
            label: compProp.name,
            content: filterIndices(
              sparks[compProp.type as keyof typeof sparks]({ ...props, type: compProp.type as any }, envs),
              compProp.props.map(({ key }) => key).concat('_editor')
            ),
          },
        };
      }
      return filterSpark({
        spark: 'grid',
        rowGap: 0,
        content: compProps.map(compProp => {
          const {
            ids: [id],
            name,
            type,
            props,
          } = compProp;
          return {
            spark: 'context',
            provide: () => ({
              useValue: getCompPropUseValue(compProp),
            }),
            content: {
              spark: 'element',
              content() {
                const { selected, onSelect } = useSelected(id, !type.startsWith('Script_'), undefined, true);
                const ref = useScrollIntoView(selected);
                const getContent = (): Spark => {
                  if (!type.startsWith('Script_')) {
                    return {
                      spark: 'group',
                      label: name,
                      extra: {
                        spark: 'element',
                        content() {
                          return (
                            <Button
                              type="link"
                              className={css({ padding: 0 })}
                              onClick={event => {
                                event.stopPropagation();
                                onVisit(prev.map(({ index }) => index).concat(id));
                              }}
                            >
                              更多设置 <Icon component={Right as any} />
                            </Button>
                          );
                        },
                      },
                      content: typeSpark(
                        {
                          type: type as any,
                          hoverable: false,
                          visitable: false,
                          deletable: true,
                          onAction(action) {
                            switch (action) {
                              case 'visit':
                                return onVisit(prev.map(({ index }) => index).concat(id));
                              case 'play':
                                return onPreview(id);
                              default:
                                throw new Error(`Unhandled action: ${action}`);
                            }
                          },
                        },
                        envs
                      ),
                    };
                  }
                  if (type === 'Script_CustomScript') {
                    return {
                      spark: 'value',
                      index: props.map(({ key }) => key).filter(key => key.startsWith('$')),
                      content(values: any[], onChange) {
                        return {
                          spark: 'grid',
                          content: customGroups(
                            {
                              callee: 'Riko.useObject',
                              default: Object.fromEntries(values.map((v, i) => [props[i].key, v])),
                              name,
                            },
                            (key, value, options) => {
                              const newValues = values.slice();
                              newValues[props.findIndex(({ key: k }) => k === key)] = value;
                              onChange(newValues, options);
                            }
                          ),
                        };
                      },
                    };
                  }
                  const { content } = { ...EVENTS, ...SCRIPTS }[type.slice('Script_'.length)] as any;
                  const result = filterIndices(content!, collectIndices(content!, ['required']));
                  return {
                    spark: 'group',
                    label: name,
                    content: result,
                  };
                };
                return (
                  <div
                    ref={ref}
                    onClick={() => onSelect({})}
                    className={css({
                      paddingBottom: 16,
                      background: selected ? 'rgb(238, 243, 254)' : 'white',
                      transition: '200ms',
                      cursor: 'pointer',
                    })}
                  >
                    {render(getContent())}
                  </div>
                );
              },
            },
          };
        }),
      });
    },
  };
};

const useScrollIntoView = (selected: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  const firstTime = ref.current === null;
  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView(firstTime ? { block: 'center' } : { behavior: 'smooth', block: 'nearest' });
    }
  }, [firstTime, selected]);
  return ref;
};
