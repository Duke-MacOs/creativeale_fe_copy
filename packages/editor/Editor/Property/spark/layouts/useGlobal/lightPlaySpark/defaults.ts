export default [
  {
    label: '文本',
    spark: 'string',
    value: {
      type: 'input',
      label: '字段名称',
      tooltip: '帮助提示',
      default: '默认值',
      notes: '详细帮助',
      maxLength: 15,
    },
  },
  {
    label: '数值',
    spark: 'number',
    value: {
      type: 'inputNumber',
      label: '字段名称',
      tooltip: '帮助提示',
      notes: '详细帮助',
      default: 3.0,
      min: 3.0,
      max: 25.0,
      step: 0.1,
      precision: 1,
      unit: '秒',
    },
  },
  {
    label: '开关',
    spark: 'boolean',
    value: {
      type: 'switch',
      label: '字段名称',
      tooltip: '帮助提示',
      notes: '详细帮助',
      default: false,
    },
  },
  {
    label: '文本选择器',
    spark: 'select',
    value: {
      type: 'radio',
      label: '字段名称',
      tooltip: '帮助提示',
      notes: '详细帮助',
      options: [
        { value: '立即领取', text: '立即领取' },
        { value: '立即下载领取', text: '立即下载领取' },
      ],
    },
  },
  {
    label: '图片选择器',
    spark: 'select',
    value: {
      type: 'imageList',
      label: '字段名称',
      tooltip: '帮助提示',
      notes: '详细帮助',
      default: 0,
      options: [
        {
          text: '卡片',
          url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/0000eh7nupsbfuhf/schema/card0.png',
          value: 0,
        },
        {
          text: '宝箱',
          url: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/0000eh7nupsbfuhf/schema/card1.png',
          value: 1,
        },
      ],
    },
  },
] as const;
