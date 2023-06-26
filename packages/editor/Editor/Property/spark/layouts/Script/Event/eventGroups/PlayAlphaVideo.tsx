import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, time_SPARK } from '../common';

export const PlayAlphaVideo: IEventDesc = {
  name: '播放出框视频',
  category: '播放控制',
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
          label: '特效地址',
        },
      ],
    },
  },
};
