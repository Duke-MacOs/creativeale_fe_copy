import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { hasSearchFlag } from '@editor/utils/hasSearchFlag';
import { IEventDesc, time_SPARK } from '../common';
import { delay } from '../common/highlight';

export const DownloadApp: IEventDesc = {
  name: '下载APP',
  category: hasSearchFlag('script', 'DownloadApp') ? '常用' : undefined,
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
    return <>{delay(time)}下载APP</>;
  },
};
