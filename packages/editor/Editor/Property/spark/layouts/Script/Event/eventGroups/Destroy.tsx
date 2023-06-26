import { useEditor } from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { DESTROY_TYPE } from '../../../../constants';
import { IEventDesc, targetId_SPARK, time_SPARK } from '../common';
import { delay, highlight } from '../common/highlight';

export const Destroy: IEventDesc = {
  name: '销毁对象',
  category: '常用',
  Summary: ({ props }) => {
    const { time, targetType } = props;
    const label = DESTROY_TYPE.find(item => item.value === targetType)?.label;
    return targetType ? (
      <>
        {delay(time)} 销毁 {highlight(label)}
      </>
    ) : null;
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        {
          spark: 'check',
          index: '',
          check: {
            options: () => {
              const { enableBlueprint } = useEditor(0, 'enableBlueprint');

              return enableBlueprint
                ? DESTROY_TYPE.filter(({ value }) => value !== 'self')
                : DESTROY_TYPE.filter(({ value }) => value !== 'node');
            },
          },
          content: {
            index: 'targetType',
            spark: 'select',
            label: '销毁对象',
            defaultValue: 'self',
            tooltip: '销毁对象',
            required: true,
          },
        },
        {
          spark: 'check',
          index: 'targetType',
          check: {
            hidden: targetType => targetType !== 'node',
          },
          content: targetId_SPARK,
        },
      ],
    },
  },
};
