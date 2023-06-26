import render, { getIndexer, updateIndices } from '@editor/Editor/Property/cells';
import { IScriptData } from '@byted/riko';
import * as EVENTS from './eventGroups';

export function getEventGroup(item: IScriptData, onChange: any, checking?: boolean) {
  const {
    type,
    props: { script },
  } = item;

  const content = type === 'Effect' ? EVENTS['Effect'].content : EVENTS[script as keyof typeof EVENTS].content;

  if (content) {
    const { openKeys = [], enabled = false } = item.editor || {};
    return render({
      spark: 'context',
      content,
      provide: () => ({
        openKeys: {
          checking,
          enabled,
          openKeys,
          setOpenKeys(checked, slice) {
            onChange({ ...item, editor: { ...item.editor, openKeys: updateIndices(openKeys, checked, slice) } });
          },
        },
        useValue: index => {
          const { indexValue, indexEntries } = getIndexer(index);
          if (index in item) {
            return {
              value: [item[index as keyof IScriptData] as any],
              onChange([value], options) {
                onChange({ ...item, [index as keyof IScriptData]: value }, options);
              },
            };
          }
          return {
            value: [indexValue(item.props)],
            onChange([value], options) {
              onChange({ ...item, props: { ...item.props, ...Object.fromEntries(indexEntries(value)) } }, options);
            },
          };
        },
      }),
    });
  }
  return null;
}
