import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';
import { labelWithNew } from '../labelWithNew';
import { delay } from '../common/highlight';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';

export const Quake: IEventDesc = {
  name: '震动反馈',
  label: labelWithNew('震动反馈'),
  category: '常用',
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
      ],
    },
  },
  Summary: ({ props: { time } }) => {
    return <>{time ? delay(time) : '立即'}执行</>;
  },
};
