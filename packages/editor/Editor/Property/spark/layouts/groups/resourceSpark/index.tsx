import type { SparkFn } from '../..';
import {
  CellContext,
  getIndexer,
  filterIndices,
  IContext,
  updateIndices,
  collectIndices,
  ICheckSpark,
} from '../../../../cells';
import { useContext, useEffect, useRef } from 'react';
import { OpenKeysEnabled } from '../extraSpark';
import { SCRIPTS } from '../../Script/Scripts';
import { EVENTS } from '../../Script/Event';
import { customGroups } from '../customGroups';
import { ICompProp } from '@editor/aStore';
import { typeSpark } from './typeSpark';
import { groupBy } from 'lodash';
import * as sparks from '../..';
import { mergeCompProps } from '@editor/utils';
import { PropsConfig } from '../../../common/CompPropsConfig';
import { useHasFeature } from '@shared/userInfo';

const getUseValue = (
  compProps: ICompProp[],
  onChange: ReturnType<IContext['useValue']>['onChange']
): IContext['useValue'] => {
  const propsValue = compProps.map(({ props, name }) =>
    Object.fromEntries([['name', name], ...props.map(({ key, default: d, value = d }) => [key, value])])
  );
  const [{ ids }] = compProps;
  return index => {
    const { indexValue, indexEntries } = getIndexer(index);
    return {
      value: propsValue.map(propsValue => indexValue(propsValue)),
      onChange(values, options) {
        if (!options?.ids?.length) {
          onChange(
            values.map(value => Object.fromEntries(indexEntries(value))),
            { ...options, ids: [ids[0]] }
          );
        } else {
          onChange(values, { ...options, ids: [ids[0], ...options.ids] });
        }
      },
    };
  };
};

let prevId: any = 0;

export const resourceSpark: SparkFn = (props, envs) => {
  if (props.type !== 'Animation' && props.type !== 'Animation3D') {
    return {
      spark: 'block',
      status: 'required',
      hidden: props.multiType,
      content: typeSpark({ type: props.type as any }, envs),
    };
  }
  return {
    spark: 'block',
    status: 'static',
    content: {
      spark: 'value',
      index: 'compProps',
      space: 'animation.comProps',
      visit: true,
      multi: true,
      content(compProps: ICompProp[][], onChange) {
        compProps = compProps.map(compProps =>
          groupCompProps(compProps).filter(({ type }) => !type.startsWith('Script_'))
        );
        const {
          visiting: { next = [], prev = [], onVisit },
          openKeys,
        } = useContext(CellContext);
        const domRef = useRef<HTMLDivElement>(null);
        const compProp = compProps.map(compProps => compProps.find(({ ids: [id] }) => id === next[0])!);
        useEffect(() => {
          domRef.current?.scrollIntoView({ block: 'center' });
        }, []);
        if (compProp.every(Boolean)) {
          const [{ ids, type, name, props: props_ }] = compProp;
          prevId = ids[0];
          const nextContent = sparks[type as keyof typeof sparks]({ ...props, type: type as any }, envs);
          return {
            spark: 'context',
            content: {
              spark: 'visit',
              index: ids[0],
              label: name,
              extra: openKeys.checking ? { spark: 'element', content: () => <OpenKeysEnabled /> } : undefined,
              content: filterIndices(nextContent, props_.map(({ key }) => key).concat('_editor')),
            },
            provide() {
              return {
                openKeys: useOpenKeys(
                  openKeys,
                  compProp[0],
                  envs.rootType === 'Scene',
                  () => compProp[0].enabled ?? envs.rootType === 'Scene',
                  () => collectIndices(nextContent, ['required'])
                ),
                useValue: getUseValue(compProp, onChange),
              };
            },
          };
        }
        return {
          spark: 'grid',
          content: compProps[0]
            .map(({ ids: [id] }) => compProps.map(compProps => compProps.find(({ ids }) => ids[0] === id)!))
            .map(compProp => {
              const [{ ids, type }] = compProp;
              return {
                spark: 'context',
                provide: () => ({
                  useValue: getUseValue(compProp, onChange),
                }),
                content: typeSpark(
                  {
                    domRef: ids[0] === prevId ? domRef : undefined,
                    type: type as any,
                    visitable: true,
                    deletable: true,
                    onAction(action) {
                      switch (action) {
                        case 'visit':
                          return onVisit(prev.map(({ index }) => index).concat(ids[0]));
                        default:
                          throw new Error(`Unhandled action: ${action}`);
                      }
                    },
                  },
                  envs
                ),
              };
            }),
        };
      },
    },
  };
};

export const compPropsGroups: SparkFn = (_, envs): ICheckSpark => {
  return {
    spark: 'check',
    index: 'compProps',
    check: {
      hidden: (compProps: any[] = []) => compProps.every(({ type }) => !type.startsWith('Script_')),
    },
    content: {
      spark: 'block',
      status: 'static',
      content: {
        spark: 'value',
        index: 'compProps',
        content(compProps: ICompProp[] = [], onChange) {
          const { openKeys } = useContext(CellContext);
          const allFeature = useHasFeature();

          return {
            spark: 'grid',
            content: [
              {
                spark: 'element',
                hidden: !allFeature,
                content() {
                  return (
                    <PropsConfig
                      value={compProps}
                      onChange={newCompProps => onChange(mergeCompProps(compProps, newCompProps))}
                    />
                  );
                },
              },
              {
                spark: 'block',
                status: 'static',
                content: {
                  spark: 'grid',
                  content: compProps
                    .filter(({ type }) => type.startsWith('Script_'))
                    .map(compProp => {
                      const newOpenKeys = useOpenKeys(
                        openKeys,
                        compProp,
                        envs.rootType === 'Scene',
                        enabled => enabled!,
                        () => []
                      );
                      if (compProp.type === 'Script_CustomScript') {
                        return {
                          spark: 'context',
                          provide() {
                            return {
                              openKeys: newOpenKeys,
                            };
                          },
                          content: {
                            spark: 'grid',
                            content: customGroups(
                              {
                                callee: 'Riko.useObject',
                                default: Object.fromEntries(
                                  compProp.props.map(({ key, default: d, value = d }) => [key, value])
                                ),
                                name: compProp.name,
                              },
                              (key, value, options) => {
                                onChange({ [key]: value }, { ...options, ids: compProp.ids });
                              }
                            ),
                          },
                        };
                      }
                      const { content } = { ...EVENTS, ...SCRIPTS }[compProp.type.slice('Script_'.length)] as any;
                      return {
                        spark: 'context',
                        provide: () => ({
                          useValue: getUseValue([compProp], ([value], options) => onChange(value, options)),
                          openKeys: newOpenKeys,
                        }),
                        content: {
                          spark: 'group',
                          label: compProp.name,
                          content: {
                            spark: 'block',
                            content: filterIndices(content!, collectIndices(content!, ['required'])),
                          },
                        },
                      };
                    }),
                },
              },
            ],
          };
        },
      },
    },
  };
};

export const groupCompProps = (compProps: ICompProp[]): ICompProp[] => {
  const groups = groupBy(compProps, ({ ids: [id] }) => id);
  return Object.values(groups)
    .map(groups => {
      if (groups.length === 1) {
        return groups[0];
      }
      const comp = groups.find(({ ids }) => ids.length === 1);
      if (comp) {
        return {
          ...comp,
          props: comp.props.concat({
            key: 'compProps',
            default: groups.filter(({ ids }) => ids.length > 1).map(comp => ({ ...comp, ids: comp.ids.slice(1) })),
          }),
        };
      }
      return {
        ids: [groups[0].ids[0]],
        type: 'Animation',
        name: '互动组件',
        props: [
          {
            key: 'compProps',
            default: groups.map(comp => ({ ...comp, ids: comp.ids.slice(1) })),
          },
        ],
      };
    })
    .filter(({ props }) => props.length);
};

const useOpenKeys = (
  { checking, enabled, setOpenKeys, setEnabled }: IContext['openKeys'],
  compProp: ICompProp,
  defaultEnabled: boolean,
  getEnabled: (enabled?: boolean) => boolean,
  getRequiredKeys: () => any[]
): IContext['openKeys'] => {
  const keys = compProp.props.reduce(
    (keys, { key, enabled = defaultEnabled }) => {
      if (enabled) {
        keys.push(key);
      }
      return keys;
    },
    ['_editor']
  );
  return {
    enabled: getEnabled(enabled),
    checking,
    openKeys: keys,
    setEnabled(enabled, ids = []) {
      setEnabled?.(enabled, [compProp.ids[0], ...ids]);
      if (enabled) {
        setOpenKeys?.(true, updateIndices(keys, true, getRequiredKeys()), [compProp.ids[0], ...ids]);
      }
    },
    setOpenKeys(checked, slice, ids = []) {
      if (!ids.length) {
        slice = updateIndices(keys, checked, slice);
      }
      setOpenKeys?.(checked, slice, [compProp.ids[0], ...ids]);
    },
  };
};
