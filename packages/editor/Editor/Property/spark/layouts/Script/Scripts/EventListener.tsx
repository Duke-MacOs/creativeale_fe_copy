import { useEditor } from '@editor/aStore';
import { HelpTooltip, IScriptDesc, once_SPARK } from '../common';

export const EventListener: IScriptDesc = {
  name: '监听事件',
  tooltip: <HelpTooltip title="监听事件" />,
  content: () => ({
    spark: 'grid',
    content: [
      {
        index: 'event',
        spark: 'string',
        label: '事件名称',
        defaultValue: '',
        tooltip: '事件名称',
        required: true,
        min: 1,
      },
      {
        spark: 'flex',
        content: [
          once_SPARK,
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
                index: 'isGlobal',
                spark: 'boolean',
                defaultValue: true,
              },
            },
          },
        ],
      },
    ],
  }),
};
