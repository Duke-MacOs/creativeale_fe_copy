import { useEditor } from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { IEventDesc, targetId_SPARK, targetNodeFilterType_SPARK, time_SPARK } from '../common';
import { delay, highlight } from '../common/highlight';

export const EmitEvent: IEventDesc = {
  name: '发送消息',
  category: '逻辑修改',
  link: '',
  checkError({ event }) {
    if (!event) return '未填写事件名称';
    return '';
  },
  Summary: ({ props: { time, event } }) => {
    return event ? (
      <>
        {delay(time)} 发送 {highlight(event as string)} 事件
      </>
    ) : (
      <>未填写事件名称</>
    );
  },
  extraProps: () => ({
    targetNodeFilterType: 'self',
  }),
  content: {
    spark: 'group',
    content: {
      spark: 'grid',
      content: [
        checkSpark(formulaSpark(time_SPARK), {
          hidden: useEnableBlueprint,
        }),
        formulaSpark({
          index: 'event',
          spark: 'string',
          label: '事件名称',
          defaultValue: '',
          tooltip: '事件名称',
          required: true,
        }),
        {
          spark: 'check',
          index: '',
          check: {
            hidden: () => {
              const { enableBlueprint } = useEditor(0, 'enableBlueprint');
              return enableBlueprint;
            },
          },
          content: {
            spark: 'label',
            label: '全局广播事件',
            tooltip: '是否是全局广播事件，否则是针对自身派发的事件（点击？查看详细解释）',
            content: {
              spark: 'boolean',
              index: 'isGlobal',
              defaultValue: true,
              required: true,
            },
          },
        },
        {
          spark: 'check',
          index: 'isGlobal',
          check: {
            hidden: isGlobal => isGlobal,
          },
          content: {
            spark: 'grid',
            content: [targetId_SPARK, targetNodeFilterType_SPARK],
          },
        },
      ],
    },
  },
};
