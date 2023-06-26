import { CANVAS_SIZE, SCALE_MODE_TYPE, SCREEN_ADAPTION } from '../../constants';
import { colorWithAlpha } from '../groups/shapeGroup/colorWithAlpha';
import { ResourceBox } from '../groups/resourceSpark/ResourceBox';
import { ArrayCell, CellContext, NULL_SPARK, Spark } from '../../../cells';
import { lightPlaySpark } from './lightPlaySpark';
import { OpenKeysEnabled } from '../groups';
import { setSettings, useSettings } from '@editor/aStore';
import { useContext } from 'react';
import { DatePicker, Modal, Radio } from 'antd';
import { css } from 'emotion';
import { chuanshanjiaSpark } from './chuanshanjiaSpark';
import moment from 'moment';
import { useStore } from 'react-redux';
import { useUpdateEffect } from '@byted/hooks';
import { absoluteUrl } from '@shared/utils';
import { blueprintSpark } from '../groups/headerGroup/nameSpark';

export const GlobalSettings: Spark = {
  spark: 'grid',
  content: [
    {
      spark: 'check',
      index: [],
      check: {
        hidden() {
          const {
            openKeys: { checking },
          } = useContext(CellContext);
          return !checking;
        },
      },
      content: {
        spark: 'element',
        content: () => <OpenKeysEnabled className={css({ height: 40, padding: '16px 16px 0' })} />,
      },
    },
    {
      spark: 'group',
      label: '画布尺寸与适配',
      content: {
        spark: 'block',
        status: 'closed',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'check',
              index: [],
              check: {
                hidden: () => {
                  const typeOfPlay = useSettings('typeOfPlay');
                  return typeOfPlay === 3;
                },
              },
              content: {
                spark: 'value',
                index: ['width', 'height', '_editor'],
                content([width = 750, height = 1334, _editor = {}], onChange) {
                  const { customSize } = _editor;
                  return {
                    spark: 'flex',
                    content: [
                      {
                        spark: 'element',
                        content: render =>
                          render({
                            spark: 'select',
                            label: '画布尺寸',
                            tooltip: '设置中央画布的尺寸大小',
                            options: CANVAS_SIZE.map(({ label }, value) => ({ label, value })).concat([
                              { value: -1, label: '自定义尺寸' },
                            ] as any),
                            value: customSize
                              ? -1
                              : CANVAS_SIZE.findIndex(({ value: [w, h] }) => w === width && h === height),
                            onChange: idx => {
                              if (idx === -1) return onChange([width, height, { ..._editor, customSize: true }]);

                              const [w, h] = CANVAS_SIZE[idx as number].value;
                              if (w === width && h === height) {
                                return onChange([width, height, { ..._editor, customSize: false }]);
                              } else {
                                Modal.confirm({
                                  title: '修改全局画布尺寸',
                                  content: '此操作将同步全部场景，是否继续',
                                  okText: '确定',
                                  cancelText: '取消',
                                  onOk: () => {
                                    onChange([...CANVAS_SIZE[idx as number].value, { ..._editor, customSize: false }]);
                                  },
                                });
                              }
                            },
                          }),
                      },
                    ],
                  };
                },
              },
            },
            {
              spark: 'check',
              index: '_editor',
              check: {
                hidden: (_editor = {}) => {
                  return !_editor.customSize;
                },
              },
              content: {
                spark: 'flex',
                content: [
                  {
                    spark: 'number',
                    label: '宽度',
                    index: 'width',
                  },
                  {
                    spark: 'number',
                    label: '高度',
                    index: 'height',
                  },
                ],
              },
            },
            {
              spark: 'select',
              index: 'scaleMode',
              label: '适配方式',
              tooltip: '选择作品的适配方式，以适应不同设备下的显示',
              options: SCALE_MODE_TYPE,
              defaultValue: 1,
            },
            {
              spark: 'select',
              index: 'screenMode',
              label: '屏幕适配',
              tooltip: '屏幕适配',
              options: SCREEN_ADAPTION,
              defaultValue: 0,
            },
          ],
        },
      },
    },
    {
      spark: 'group',
      label: '背景填充',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'value',
              index: 'bgImage',
              content(url = '', onChange) {
                return {
                  spark: 'element',
                  content() {
                    return (
                      <ResourceBox
                        deletable
                        type="Sprite"
                        name="全局背景图"
                        tips={['建议尺寸：最佳为 750*1334']}
                        url={url}
                        onChange={({ url }) => {
                          onChange(url);
                        }}
                      />
                    );
                  },
                };
              },
            },
          },
          {
            spark: 'block',
            status: 'required',
            content: colorWithAlpha({
              index: 'bgColor',
              label: '背景',
              defaultValue: '#ffffff',
            }),
          },
        ],
      },
    },
    {
      spark: 'group',
      label: '背景音乐',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'value',
              index: ['bgMusic', '_editor'],
              content([url = '', _editor = {}], onChange) {
                const { name } = _editor;
                return {
                  spark: 'element',
                  content() {
                    return (
                      <ResourceBox
                        type="Sound"
                        name={name}
                        deletable
                        url={url}
                        onChange={({ url, name }) => {
                          onChange([url, { ..._editor, name }]);
                        }}
                      />
                    );
                  },
                };
              },
            },
          },
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'slider',
              index: 'bgMusicVoice',
              label: '音量',
              defaultValue: 1,
              tooltip: '音量',
              precision: 0,
              step: 0.01,
              ratio: 100,
              min: 0,
              max: 2,
              unit: '%',
            },
          },
        ],
      },
    },
    {
      spark: 'group',
      label: '高级',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'closed',
            cols: 3,
            content: {
              spark: 'label',
              label: '多点触控',
              tooltip: '是否开启多点触控',
              content: {
                spark: 'boolean',
                index: 'multiTouchEnabled',
                defaultValue: false,
              },
            },
          },
          {
            spark: 'block',
            status: 'closed',
            cols: 3,
            content: {
              spark: 'label',
              label: '手动上报埋点',
              tooltip: '开启后只上报手动埋点，不上报其他自动埋点',
              content: {
                spark: 'boolean',
                index: 'enableManualEvent',
                defaultValue: false,
              },
            },
          },
        ],
      },
    },
    {
      spark: 'check',
      index: 'typeOfPlay',
      check: {
        hidden: typeOfPlay => {
          return typeOfPlay !== 0 && typeOfPlay !== 2;
        },
      },
      content: {
        spark: 'block',
        status: 'static',
        content: {
          spark: 'value',
          index: 'typeOfPlay',
          visit: true,
          content(typeofPlay: number) {
            return {
              spark: 'enter',
              index: 'store',
              content:
                {
                  0: chuanshanjiaSpark(),
                  2: lightPlaySpark(),
                }[typeofPlay] ?? NULL_SPARK,
            };
          },
        },
      },
    },
    {
      spark: 'check',
      index: 'typeOfPlay',
      check: {
        hidden: typeOfPlay => {
          return typeOfPlay !== 3;
        },
      },
      content: {
        spark: 'block',
        status: 'static',
        content: {
          spark: 'enter',
          index: 'hyruleJson',
          content: {
            spark: 'enter',
            index: 'mask',
            content: {
              spark: 'group',
              label: '结束蒙层',
              content: {
                spark: 'grid',
                content: [
                  {
                    spark: 'string',
                    index: 'title',
                    label: 'icon主标题',
                  },
                  {
                    spark: 'string',
                    index: 'subtitle',
                    label: 'icon副标题',
                  },
                  {
                    spark: 'enter',
                    index: 'reward_info',
                    content: {
                      spark: 'grid',
                      content: [
                        {
                          spark: 'value',
                          index: 'reward_type',
                          content(reward_type = 0, onChange) {
                            return {
                              spark: 'label',
                              label: '奖励类型',
                              content: {
                                spark: 'element',
                                content() {
                                  const { dispatch, getState } = useStore<EditorState>();
                                  useUpdateEffect(() => {
                                    const hyruleJson = getState().project.settings.hyruleJson || {};
                                    if (reward_type) {
                                      dispatch(
                                        setSettings({
                                          hyruleJson: {
                                            ...hyruleJson,
                                            mask: {
                                              ...hyruleJson.mask,
                                              reward_info: {
                                                ...hyruleJson.mask?.reward_info,
                                                reward_type,
                                                before: {
                                                  icon: {
                                                    url_list: [
                                                      [
                                                        'https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/libao_icon_before.png',
                                                      ],
                                                      [
                                                        'https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/quan_icon_before.png',
                                                      ],
                                                    ][reward_type - 1],
                                                  },
                                                  title: '',
                                                },
                                                after: {
                                                  icon: {
                                                    url_list: [
                                                      [
                                                        'https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/libao_icon_after.png',
                                                      ],
                                                      [
                                                        'https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/quan_icon_after.png',
                                                      ],
                                                    ][reward_type - 1],
                                                  },
                                                  title: '',
                                                  value: '',
                                                  unit: '',
                                                },
                                              },
                                            },
                                          },
                                        })
                                      );
                                    } else {
                                      dispatch(
                                        setSettings({
                                          hyruleJson: {
                                            ...hyruleJson,
                                            mask: {
                                              ...hyruleJson.mask,
                                              reward_info: undefined,
                                            },
                                          },
                                        })
                                      );
                                    }
                                  }, [reward_type]);
                                  return (
                                    <Radio.Group
                                      options={[
                                        { label: '礼包码', value: 1 },
                                        { label: '优惠券', value: 2 },
                                        { label: '无', value: 0 },
                                      ]}
                                      value={reward_type}
                                      onChange={({ target: { value } }) => {
                                        onChange(value);
                                      }}
                                    />
                                  );
                                },
                              },
                            };
                          },
                        },
                        {
                          spark: 'check',
                          index: 'reward_type',
                          check: {
                            hidden: reward_type => !reward_type || reward_type === 0,
                            content: reward_type =>
                              reward_type === 1
                                ? [
                                    {
                                      spark: 'enter',
                                      index: 'before',
                                      content: {
                                        spark: 'string',
                                        index: 'title',
                                        label: '领取前标题',
                                        placeholder: '如：领取价值20元的礼包码',
                                      },
                                    },
                                    {
                                      spark: 'enter',
                                      index: 'after',
                                      content: {
                                        spark: 'string',
                                        index: 'title',
                                        label: '领取后标题',
                                        placeholder: '如：价值20元的礼包码',
                                      },
                                    },
                                    {
                                      spark: 'enter',
                                      index: 'after',
                                      content: {
                                        spark: 'string',
                                        index: 'value',
                                        label: '礼包码',
                                        placeholder: '如：666666',
                                      },
                                    },
                                    {
                                      spark: 'enter',
                                      index: 'after',
                                      content: {
                                        spark: 'string',
                                        index: 'unit',
                                        label: '复制文案',
                                        placeholder: '如：复制',
                                      },
                                    },
                                  ]
                                : [
                                    {
                                      spark: 'enter',
                                      index: 'before',
                                      content: {
                                        spark: 'string',
                                        index: 'title',
                                        label: '领取前标题',
                                        placeholder: '如：限时优惠券',
                                      },
                                    },
                                    {
                                      spark: 'flex',
                                      content: [
                                        {
                                          spark: 'enter',
                                          index: 'before',
                                          content: {
                                            spark: 'string',
                                            index: 'value',
                                            label: '优惠券折扣',
                                            placeholder: '如：7',
                                          },
                                        },
                                        {
                                          spark: 'enter',
                                          index: 'before',
                                          content: {
                                            spark: 'string',
                                            index: 'unit',
                                            label: '折扣单位',
                                            placeholder: '如：折',
                                          },
                                        },
                                      ],
                                    },
                                    {
                                      spark: 'enter',
                                      index: 'after',
                                      content: {
                                        spark: 'string',
                                        index: 'title',
                                        label: '领取后标题',
                                        placeholder: '如：新人优惠券',
                                      },
                                    },
                                    {
                                      spark: 'flex',
                                      content: [
                                        {
                                          spark: 'enter',
                                          index: 'after',
                                          content: {
                                            spark: 'string',
                                            index: 'value',
                                            label: '优惠卷面值',
                                            placeholder: '如：99',
                                          },
                                        },
                                        {
                                          spark: 'enter',
                                          index: 'after',
                                          content: {
                                            spark: 'string',
                                            index: 'unit',
                                            label: '优惠券单位',
                                            placeholder: '如：元',
                                          },
                                        },
                                      ],
                                    },
                                    {
                                      spark: 'enter',
                                      index: 'after',
                                      content: {
                                        spark: 'value',
                                        index: ['start_time', 'end_time'],
                                        content(value: any = [], onChange: any) {
                                          return {
                                            spark: 'label',
                                            label: '优惠券生效时间',
                                            content: {
                                              spark: 'element',
                                              content() {
                                                return (
                                                  <DatePicker.RangePicker
                                                    value={value.map((v: any) => (v ? moment(v) : v))}
                                                    onChange={dates => {
                                                      if (dates) {
                                                        onChange(dates.map(date => date!.format('YYYY-MM-DD')));
                                                      } else {
                                                        onChange([undefined, undefined]);
                                                      }
                                                    }}
                                                    placeholder={['开始时间', '结束时间']}
                                                  />
                                                );
                                              },
                                            },
                                          };
                                        },
                                      },
                                    },
                                  ],
                          },
                          content: {
                            spark: 'grid',
                            content: [],
                          },
                        },
                      ],
                    },
                  },
                  {
                    spark: 'enter',
                    index: 'picture_info',
                    content: {
                      spark: 'grid',
                      content: [
                        {
                          spark: 'string',
                          index: 'title',
                          label: '结束蒙层title',
                        },
                        {
                          spark: 'value',
                          index: 'picture_list',
                          content(picture_list = [], onChange) {
                            return {
                              spark: 'element',
                              content() {
                                return (
                                  <ArrayCell
                                    defaultItem={{
                                      url_list: [] as (string | undefined)[],
                                    }}
                                    array={picture_list}
                                    onChange={values => {
                                      onChange(!values.length ? undefined : values);
                                    }}
                                    label="结束蒙层滚动图"
                                    maxLength={3}
                                    defaultExpanded
                                    render={(value, onChange) => {
                                      const { url_list } = value;
                                      const url = url_list[0];

                                      return (
                                        <ResourceBox
                                          deletable
                                          required
                                          type="Sprite"
                                          url={url}
                                          name="蒙层"
                                          onChange={async ({ url }) => {
                                            onChange({
                                              url_list: [url ? absoluteUrl(url) : url],
                                            });
                                          }}
                                        />
                                      );
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
                ],
              },
            },
          },
        },
      },
    },
  ],
};

export const VRVideoGlobalSettings: Spark = {
  spark: 'grid',
  content: [
    {
      spark: 'check',
      index: [],
      check: {
        hidden() {
          const {
            openKeys: { checking },
          } = useContext(CellContext);
          return !checking;
        },
      },
      content: {
        spark: 'element',
        content: () => <OpenKeysEnabled className={css({ height: 40, padding: '16px 16px 0' })} />,
      },
    },
    {
      spark: 'group',
      label: '画布尺寸与适配',
      content: {
        spark: 'block',
        status: 'closed',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'check',
              index: [],
              check: {
                /*  hidden: () => {
                  const { typeOfPlay } = useProject('settings');
                  return typeOfPlay === 3;
                }, */
              },
              content: {
                spark: 'value',
                index: ['width', 'height', '_editor'],
                content([width = 750, height = 1334, _editor = {}], onChange) {
                  const { customSize } = _editor;
                  return {
                    spark: 'flex',
                    content: [
                      {
                        spark: 'element',
                        content: render =>
                          render({
                            spark: 'select',
                            label: '画布尺寸',
                            tooltip: '设置中央画布的尺寸大小',
                            options: CANVAS_SIZE.map(({ label }, value) => ({ label, value })).concat([
                              { value: -1, label: '自定义尺寸' },
                            ] as any),
                            value: customSize
                              ? -1
                              : CANVAS_SIZE.findIndex(({ value: [w, h] }) => w === width && h === height),
                            onChange: idx => {
                              if (idx === -1) return onChange([width, height, { ..._editor, customSize: true }]);

                              const [w, h] = CANVAS_SIZE[idx as number].value;
                              if (w === width && h === height) {
                                return onChange([width, height, { ..._editor, customSize: false }]);
                              } else {
                                Modal.confirm({
                                  title: '修改全局画布尺寸',
                                  content: '此操作将同步全部场景，是否继续',
                                  okText: '确定',
                                  cancelText: '取消',
                                  onOk: () => {
                                    onChange([...CANVAS_SIZE[idx as number].value, { ..._editor, customSize: false }]);
                                  },
                                });
                              }
                            },
                          }),
                      },
                      { ...blueprintSpark({ type: 'Project' }), basis: 'auto' },
                    ],
                  };
                },
              },
            },
            {
              spark: 'check',
              index: '_editor',
              check: {
                hidden: (_editor = {}) => {
                  return !_editor.customSize;
                },
              },
              content: {
                spark: 'flex',
                content: [
                  {
                    spark: 'number',
                    label: '宽度',
                    index: 'width',
                  },
                  {
                    spark: 'number',
                    label: '高度',
                    index: 'height',
                  },
                ],
              },
            },
            {
              spark: 'select',
              index: 'scaleMode',
              label: '适配方式',
              tooltip: '选择作品的适配方式，以适应不同设备下的显示',
              options: SCALE_MODE_TYPE,
              defaultValue: 1,
            },
            {
              spark: 'select',
              index: 'screenMode',
              label: '屏幕适配',
              tooltip: '屏幕适配',
              options: SCREEN_ADAPTION,
              defaultValue: 0,
            },
          ],
        },
      },
    },
    {
      spark: 'group',
      label: '背景填充',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'value',
              index: 'bgImage',
              content(url = '', onChange) {
                return {
                  spark: 'element',
                  content() {
                    return (
                      <ResourceBox
                        deletable
                        type="Sprite"
                        name="全局背景图"
                        tips={['建议尺寸：最佳为 750*1334']}
                        url={url}
                        onChange={({ url }) => {
                          onChange(url);
                        }}
                      />
                    );
                  },
                };
              },
            },
          },
          {
            spark: 'block',
            status: 'required',
            content: colorWithAlpha({
              index: 'bgColor',
              label: '背景',
              defaultValue: '#ffffff',
            }),
          },
        ],
      },
    },
    {
      spark: 'group',
      label: '背景音乐',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'value',
              index: ['bgMusic', '_editor'],
              content([url = '', _editor = {}], onChange) {
                const { name } = _editor;
                return {
                  spark: 'element',
                  content() {
                    return (
                      <ResourceBox
                        type="Sound"
                        name={name}
                        deletable
                        url={url}
                        onChange={({ url, name }) => {
                          onChange([url, { ..._editor, name }]);
                        }}
                      />
                    );
                  },
                };
              },
            },
          },
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'slider',
              index: 'bgMusicVoice',
              label: '音量',
              defaultValue: 1,
              tooltip: '音量',
              precision: 0,
              step: 0.01,
              ratio: 100,
              min: 0,
              max: 2,
              unit: '%',
            },
          },
        ],
      },
    },
    {
      spark: 'group',
      label: '高级',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'block',
            status: 'closed',
            content: {
              spark: 'label',
              label: '陀螺仪',
              tooltip: '是否开启陀螺仪',
              content: {
                spark: 'boolean',
                index: 'gyroscope',
                defaultValue: true,
              },
            },
          },
          {
            spark: 'block',
            status: 'closed',
            content: {
              spark: 'label',
              label: '触摸',
              tooltip: '是否开启触摸',
              content: {
                spark: 'boolean',
                index: 'touch',
                defaultValue: true,
              },
            },
          },
          {
            spark: 'block',
            status: 'required',
            content: {
              spark: 'slider',
              index: 'sensitivity',
              label: '灵敏度',
              defaultValue: 1,
              tooltip: '灵敏度',
              precision: 0,
              step: 0.01,
              ratio: 100,
              min: 0,
              max: 2,
              unit: '%',
            },
          },
          {
            spark: 'number',
            index: 'fieldOfView',
            defaultValue: 90,
            label: '垂直视角',
            min: 60,
            max: 120,
          },
        ],
      },
    },
    // lightPlaySpark(),
  ],
};
