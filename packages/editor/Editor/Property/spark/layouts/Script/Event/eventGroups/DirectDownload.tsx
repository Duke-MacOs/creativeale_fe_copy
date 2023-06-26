import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';
import { labelWithNew } from '../labelWithNew';

export const DirectDownload: IEventDesc = {
  name: '调起下载组件',
  label: labelWithNew('调起下载组件'),
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
          spark: 'label',
          label: '5秒后自动触发',
          content: {
            spark: 'boolean',
            index: 'autoTrigger',
            defaultValue: true,
          },
        },
      ],
    },
  },
  Summary: ({ props: { time } }) => {
    return time ? <>{delay(time)}执行</> : <>立即执行</>;
  },
};
