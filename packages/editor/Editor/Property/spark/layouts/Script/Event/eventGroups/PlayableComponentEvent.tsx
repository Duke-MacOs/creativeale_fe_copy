import { PLAYABLE_COMPONENT_EVENT_TYPE } from '../../../../constants';
import { IEventDesc } from '../common';
import { highlight } from '../common/highlight';

export const PlayableComponentEvent: IEventDesc = {
  name: '轻互动事件',
  category: '辅助操作',
  Summary: ({ props: { event } }) => {
    const label = PLAYABLE_COMPONENT_EVENT_TYPE.find(opt => opt.value === event)?.label;
    return <>{highlight(label)}</>;
  },
  content: {
    spark: 'group',
    content: {
      index: 'event',
      spark: 'select',
      label: '触发事件',
      tooltip: '触发事件',
      defaultValue: 'finishEvent',
      options: PLAYABLE_COMPONENT_EVENT_TYPE,
      required: true,
    },
  },
};
