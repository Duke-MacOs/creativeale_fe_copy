import render, { ArrayCell, getIndexer, INumberSpark, Spark } from '@editor/Editor/Property/cells';
import { COLLIDER_TYPE } from '@editor/Editor/Property/spark/constants';
import { formulaSpark } from '../../../../../common/formulaSpark';
import { SyncNodeProps } from '../../components/SyncNodeProps';
import { radiusSpark, x_SPARK, y_SPARK, width_SPARK, height_SPARK } from '../../common';
import { omit } from 'lodash';
import { useSelected } from '@editor/aStore';
import { useStore } from 'react-redux';
import { getScene } from '@editor/utils';

export function getCollideGroup(item: any, onChange: any): Spark {
  return {
    spark: 'context',
    provide: () => ({
      useValue(index) {
        const { indexValue, indexEntries } = getIndexer(index);
        return {
          value: [indexValue(item)],
          onChange([value], options) {
            if (!options?.replace) {
              onChange({ ...item, ...Object.fromEntries(indexEntries(value)) }, options);
            } else {
              onChange(value, omit(options, 'replace'));
            }
          },
        };
      },
    }),
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'value',
          index: 'type',
          content(value = 'box', onChange) {
            return {
              spark: 'element',
              content(render) {
                const { getState } = useStore<EditorState, EditorAction>();
                const {
                  selected: { nodeIds },
                } = useSelected(0);
                return render({
                  spark: 'select',
                  label: '类型',
                  value,
                  onChange(newValue) {
                    const { props } = getScene(getState().project);
                    const { width, height, x, y } = props[nodeIds[0]];
                    onChange(
                      Object.assign(
                        { ...item, type: newValue },
                        newValue === 'polygon' && [width, height, x, y].every(value => value !== undefined)
                          ? {
                              points: [
                                { x: +(width! / 2).toFixed(1), y: 0 },
                                { x: 0, y: height },
                                { x: width, y: height },
                              ],
                            }
                          : {}
                      ),
                      {
                        replace: true,
                      }
                    );
                  },
                  options: COLLIDER_TYPE,
                  tooltip: '碰撞类型',
                });
              },
            };
          },
        },
        {
          spark: 'flex',
          content: [
            {
              spark: 'check',
              index: 'type',
              check: {
                hidden: value => value === 'polygon',
              },
              content: {
                spark: 'label',
                label: '自动大小',
                tooltip: '自动计算大小',
                content: {
                  index: 'autoSize',
                  spark: 'boolean',
                  defaultValue: false,
                },
              },
            },
            {
              spark: 'label',
              label: '传感器',
              tooltip: '是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应',
              content: {
                index: 'isSensor',
                spark: 'boolean',
                defaultValue: false,
              },
            },
          ],
        },
        {
          spark: 'check',
          index: 'type',
          check: {
            hidden: value => value !== 'polygon',
          },
          content: {
            spark: 'value',
            index: 'points',
            content(points = [], onChange) {
              return {
                spark: 'element',
                content() {
                  return (
                    <ArrayCell
                      label="顶点"
                      array={points}
                      onChange={onChange}
                      defaultItem={onAdd => {
                        if (points.length) {
                          const item = points[points.length - 1];
                          return onAdd({ x: item.x + 100, y: item.y + 100 });
                        }
                        return onAdd({ x: 0, y: 0 });
                      }}
                      render={(point, onChange) => {
                        const { x, y } = point || {};
                        return render({
                          spark: 'flex',
                          content: [
                            {
                              spark: 'element',
                              content(render) {
                                return render({
                                  spark: 'number',
                                  label: '横坐标',
                                  value: x,
                                  onChange(x) {
                                    onChange({ ...point, x });
                                  },
                                });
                              },
                            },
                            {
                              spark: 'element',
                              content(render) {
                                return render({
                                  spark: 'number',
                                  label: '纵坐标',
                                  value: y,
                                  onChange(y) {
                                    onChange({ ...point, y });
                                  },
                                });
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
          },
        },
        {
          spark: 'check',
          index: 'autoSize',
          check: {
            hidden: autoSize => autoSize,
          },
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'flex',
                content: [
                  formulaSpark({ ...x_SPARK, width: 48 } as INumberSpark),
                  formulaSpark({ ...y_SPARK, width: 48 } as INumberSpark),
                ],
              },
              {
                spark: 'check',
                index: 'type',
                check: {
                  hidden: value => value !== 'box',
                },
                content: {
                  spark: 'flex',
                  content: [
                    formulaSpark({ ...width_SPARK, width: 48 } as INumberSpark),
                    formulaSpark({ ...height_SPARK, width: 48 } as INumberSpark),
                  ],
                },
              },
              {
                spark: 'check',
                index: 'type',
                check: {
                  hidden: value => value !== 'circle',
                },
                content: radiusSpark,
              },
              {
                spark: 'value',
                index: ['type', 'width', 'height', 'radius'],
                content([type, width, height, radius], onChange) {
                  return {
                    spark: 'element',
                    content() {
                      return (
                        <SyncNodeProps
                          onChange={({ width: w = width, height: h = height }) => {
                            if (type === 'box') {
                              onChange([type, w, h, radius]);
                            }
                            if (type === 'circle') {
                              const radius = Math.min(w, h) / 2;
                              onChange([type, width, height, radius]);
                            }
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
        formulaSpark({ index: 'density', spark: 'number', label: '密度', defaultValue: 10, tooltip: '密度' }),
        {
          index: 'friction',
          spark: 'slider',
          label: '摩擦系数',
          defaultValue: 0.2,
          tooltip: '摩擦系数',
          min: 0,
          max: 1,
          step: 0.01,
          ratio: 100,
          unit: '%',
          precision: 0,
        },
        {
          index: 'restitution',
          spark: 'slider',
          label: '弹性系数',
          defaultValue: 0,
          tooltip: '弹性系数',
          min: 0,
          max: 1,
          step: 0.01,
          ratio: 100,
          unit: '%',
          precision: 0,
        },
      ],
    },
  };
}
