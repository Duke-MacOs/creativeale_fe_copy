import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { ResourceBox } from '../../../groups/resourceSpark/ResourceBox';
import { IEventDesc, time_SPARK } from '../common';
import { delay, highlight } from '../common/highlight';

export const PlaySound: IEventDesc = {
  name: '播放声音',
  category: '常用',
  checkError({ url }) {
    if (!url) return '未设置声音';
    return '';
  },
  Summary: ({ props }) => {
    const { time, _editor, _vName } = props;
    const { name = _vName } = (_editor as any) || {};
    return name ? (
      <>
        {delay(time)}播放 {highlight(name)} 音效
      </>
    ) : (
      <>未设置声音</>
    );
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
          spark: 'block',
          status: 'required',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'value',
                index: ['url', '_editor'],
                content([url, editor = {}], onChange) {
                  return {
                    spark: 'value',
                    index: 'name',
                    content(name) {
                      return {
                        spark: 'element',
                        content() {
                          return (
                            <ResourceBox
                              deletable
                              type="Sound"
                              url={url}
                              name={editor.name || name}
                              cover={editor.cover}
                              onChange={({ url: u = url, name, cover }) => {
                                onChange([u, { ...editor, name, cover }]);
                              }}
                            />
                          );
                        },
                      };
                    },
                  };
                },
              },
              {
                spark: 'slider',
                index: 'volume',
                label: '音量',
                tooltip: '音量',
                defaultValue: 1,
                precision: 0,
                ratio: 100,
                unit: '%',
                step: 0.01,
                min: 0,
                max: 2,
              },
            ],
          },
        },
      ],
    },
  },
};
