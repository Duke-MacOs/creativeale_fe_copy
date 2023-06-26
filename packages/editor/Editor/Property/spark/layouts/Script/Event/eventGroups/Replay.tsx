import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';

export const Replay: IEventDesc = {
  name: '重玩',
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
};
