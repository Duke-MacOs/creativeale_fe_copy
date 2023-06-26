import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc } from '../common';
import { highlight } from '../common/highlight';

export const Print: IEventDesc = {
  name: '打印日志',
  category: '辅助操作',
  checkError({ value }) {
    if (!value) return '未填写日志';
    return '';
  },
  Summary: ({ props }) => {
    const { value = '' } = props;
    return <>打印 {highlight(value as string)} 日志</>;
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        formulaSpark({
          spark: 'string',
          index: 'value',
          label: '打印内容',
          tooltip: '打印内容',
          required: true,
          defaultValue: '',
        }),
      ],
    },
  },
};
