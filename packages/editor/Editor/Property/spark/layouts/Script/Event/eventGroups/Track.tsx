import { useSettings } from '@editor/aStore';
import { formulaSpark } from '@editor/Editor/Property/spark/common/formulaSpark';
import { TRACK_TYPE } from '../../../../constants';
import { IEventDesc, time_SPARK } from '../common';
import { highlight } from '../common/highlight';

export const Track: IEventDesc = {
  name: '埋点事件',
  category: '辅助操作',
  Summary: ({ props }) => {
    const { eventType } = props;
    const label = TRACK_TYPE.find(item => item.value === eventType)?.label;
    return <>{highlight(label)}</>;
  },
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        time_SPARK,
        {
          spark: 'check',
          index: [],
          check: {
            options: () => {
              const typeOfPlay = useSettings('typeOfPlay');
              if (typeOfPlay !== 3) {
                return TRACK_TYPE;
              }
              return TRACK_TYPE.filter(({ value }) => value !== 'playableEnd');
            },
          },
          content: {
            index: 'eventType',
            spark: 'select',
            label: '埋点类型',
            tooltip: '埋点类型',
            required: true,
          },
        },
        {
          spark: 'check',
          index: 'eventType',
          check: {
            hidden: eventType => eventType !== 'enterSection',
          },
          content: {
            spark: 'grid',
            content: [
              formulaSpark({
                spark: 'number',
                index: 'section',
                label: '场景ID',
                tooltip: '场景唯一标识',
                defaultValue: 1,
                precision: 0,
                min: 1,
              }),
              formulaSpark({
                spark: 'string',
                index: 'sectionRemark',
                label: '场景名称',
                defaultValue: '场景1',
                tooltip: '场景名称',
              }),
            ],
          },
        },
      ],
    },
  },
};
