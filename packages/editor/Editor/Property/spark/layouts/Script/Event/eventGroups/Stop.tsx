import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';

export const Stop: IEventDesc = {
  name: '暂停播放',
  category: '播放控制',
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
    return time ? <>{delay(time)}执行</> : <>立即执行</>;
  },
};
