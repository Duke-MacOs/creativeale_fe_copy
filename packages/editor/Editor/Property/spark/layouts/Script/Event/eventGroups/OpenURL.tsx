import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';

export const OpenURL: IEventDesc = {
  name: '跳转链接',
  category: '常用',
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        {
          spark: 'string',
          index: 'url',
          label: '链接地址',
        },
      ],
    },
  },
  Summary: ({ props: { time } }) => {
    return time ? <>{delay(time)}执行</> : <>立即执行</>;
  },
};
