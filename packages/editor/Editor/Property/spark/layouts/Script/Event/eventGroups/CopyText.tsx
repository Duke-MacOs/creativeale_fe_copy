import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc } from '../common';
import { highlight } from '../common/highlight';

export const CopyText: IEventDesc = {
  name: '复制文本',
  category: '辅助操作',
  link: '',
  checkError({ text }) {
    if (!text) {
      return '未填写文本';
    }
    return '';
  },
  Summary: ({ props }) => {
    const { text = '' } = props;
    return <>复制文本 {highlight(text as string)}</>;
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          status: 'required',
          content: formulaSpark({
            index: 'text',
            spark: 'string',
            type: 'area',
            label: '文本',
            defaultValue: '',
            align: 'top',
            tooltip: '文本',
            required: true,
          }),
        },
      ],
    },
  },
};
