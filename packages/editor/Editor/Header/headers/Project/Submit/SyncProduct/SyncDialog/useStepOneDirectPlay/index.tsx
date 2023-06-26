import { useEventBus } from '@byted/hooks';
import { Form, FormInstance, Input, Radio, DatePicker } from 'antd';
import { StepHookReturn } from '../StepDialog';
import React, { useRef } from 'react';
import { useState } from 'react';

const options = [
  { label: '礼包码', value: 1 },
  { label: '优惠券', value: 2 },
  { label: '无', value: 0 },
];

export default (form: FormInstance<any>): StepHookReturn => {
  const { trigger } = useEventBus('ExportSettings');
  const store = useRef({
    1: {
      before_title: '',
      after_title: '',
      after_value: '',
      after_unit: '',
    },
    2: {
      before_title: '',
      before_value: '',
      before_unit: '',
      after_title: '',
      after_value: '',
      after_unit: '',
      after_time: [],
    },
  });
  const [rewardType, setRewardType] = useState(0 as keyof typeof store.current);
  const GRID_COLUMNS = 6;

  return {
    title: '结束蒙层设置',
    okDisabled: false,
    cancelDisabled: false,
    spinning: false,
    element: (
      <Form form={form} initialValues={store.current[rewardType]}>
        <Form.Item label="奖励类型" rules={[{ required: true, message: '请选择该素材的奖励类型！' }]}>
          <Radio.Group
            options={options}
            value={rewardType}
            onChange={({ target: { value } }) => {
              store.current[rewardType] = form.getFieldsValue();
              setRewardType(value);
              form.setFieldsValue(store.current[value as typeof rewardType]);
            }}
          />
        </Form.Item>
        <div style={{ display: 'grid', gridTemplate: `auto / repeat(${GRID_COLUMNS},1fr)` }}>
          {{
            1: [
              {
                label: '领取前标题',
                name: 'before_title',
                Component: <Input placeholder="如：领取价值20元的礼包码" />,
              },
              {
                label: '领取后标题',
                name: 'after_title',
                Component: <Input placeholder="如：价值20元的礼包码" />,
              },
              {
                label: '礼包码',
                name: 'after_value',
                Component: <Input placeholder="如：666666" />,
              },
              {
                label: '复制文案',
                name: 'after_unit',
                Component: <Input placeholder="如：复制" />,
              },
            ],
            2: [
              {
                label: '领取前标题',
                name: 'before_title',
                Component: <Input placeholder="如：限时优惠券" />,
              },
              {
                label: '优惠券折扣',
                name: 'before_value',
                col: 3,
                Component: <Input placeholder="如：7" />,
              },
              {
                label: '折扣单位',
                name: 'before_unit',
                col: 3,
                Component: <Input placeholder="如：折" />,
              },
              {
                label: '领取后标题',
                name: 'after_title',
                Component: <Input placeholder="如：新人优惠券" />,
              },
              {
                label: '优惠卷面值',
                name: 'after_value',
                Component: <Input placeholder="如：99" />,
                col: 3,
              },
              {
                label: '优惠券单位',
                name: 'after_unit',
                Component: <Input placeholder="如：元" />,
                col: 3,
              },
              {
                label: '优惠券生效时间',
                name: 'after_time',
                Component: <DatePicker.RangePicker placeholder={['开始时间', '结束时间']} />,
              },
            ],
          }[rewardType]?.map(({ Component, ...props }) => {
            const LABEL_SPAN = 3;
            const col = (props as any).col ?? GRID_COLUMNS;
            return (
              <Form.Item
                style={{ gridColumn: `span ${col}` }}
                {...{
                  labelCol: { span: (GRID_COLUMNS / col) * LABEL_SPAN },
                  rules: [{ required: true, message: `请输入${props.label}` }],
                  ...props,
                }}
              >
                {React.cloneElement(Component, { placeholder: Component.props.placeholder ?? `请输入${props.label}` })}
              </Form.Item>
            );
          })}
        </div>
      </Form>
    ),
    async mapValues({
      before_title,
      before_value = '',
      before_unit = '',
      after_title,
      after_value,
      after_unit,
      after_time,
    }: any) {
      if (rewardType) {
        trigger({
          reward_info: {
            reward_type: rewardType,
            before: {
              icon: {
                url_list: [
                  ['https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/libao_icon_before.png'],
                  ['https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/quan_icon_before.png'],
                ][rewardType - 1],
              },
              title: before_title,
              value: before_value,
              unit: before_unit,
            },
            after: {
              icon: {
                url_list: [
                  ['https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/libao_icon_after.png'],
                  ['https://case-cdn.oceanplayable.com/obj/union-fe/feed-playable/icon/quan_icon_after.png'],
                ][rewardType - 1],
              },
              title: after_title,
              value: after_value,
              unit: after_unit,
              start_time: after_time?.[0]?.format('YYYY-MM-DD') ?? '',
              end_time: after_time?.[1]?.format('YYYY-MM-DD') ?? '',
            },
          },
        });
      } else {
        trigger({ reward_info: undefined });
      }
      return {};
    },
  };
};
