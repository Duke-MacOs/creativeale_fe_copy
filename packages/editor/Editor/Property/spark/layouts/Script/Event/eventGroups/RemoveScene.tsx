import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';

export const RemoveScene: IEventDesc = {
  name: '移除场景',
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
    return <>{delay(time)}移除场景</>;
  },
};
