import render, { ArrayCell, callValue, IGroupSpark } from '../../../../cells';
import type { SparkFn } from '../..';

export const stepsGroup: SparkFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '时间控制点设置',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'string',
          index: 'section',
          label: 'section',
          placeholder: '请输入section名称',
        },
        {
          spark: 'value',
          index: 'steps',
          content(steps = [], onChange) {
            return {
              spark: 'element',
              content() {
                return (
                  <ArrayCell
                    label="控制点"
                    array={steps}
                    defaultExpanded
                    sortable={false}
                    onChange={onChange}
                    defaultItem={steps[steps.length - 1] ?? { action: 'down', time: 0 }}
                    render={(item, onChange, index) => {
                      const { action, time } = item ?? {};
                      return render({
                        spark: 'flex',
                        content: [
                          {
                            spark: 'element',
                            content: render =>
                              render({
                                spark: 'select',
                                value: action,
                                label: '动作',
                                width: 40,
                                options: [
                                  { label: '下沉视频', value: 'down' },
                                  { label: '上浮视频', value: 'up' },
                                  { label: '高亮按钮', value: 'button_highlight' },
                                ],
                                onChange(action, options) {
                                  onChange({ action, time }, options);
                                },
                              }),
                          },
                          {
                            spark: 'element',
                            content: render =>
                              render({
                                spark: 'number',
                                value: time,
                                label: '时间',
                                unit: 's',
                                ratio: -1000,
                                width: 40,
                                step: 100,
                                min: steps[index - 1]?.time ?? 0,
                                max: steps[index + 1]?.time,
                                precision: 1,
                                onChange(timeFn, options) {
                                  onChange({ action, time: callValue(timeFn, time) }, options);
                                },
                              }),
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
      ],
    },
  };
};
