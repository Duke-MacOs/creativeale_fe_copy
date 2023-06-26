import { INumberSpark } from '@editor/Editor/Property/cells';
import { formulaSpark } from '../../../../common/formulaSpark';
import { PARENT_TYPE } from '../../../../constants';
import { ResourceBox } from '../../../groups/resourceSpark/ResourceBox';
import { IEventDesc, targetId_SPARK, time_SPARK, x_SPARK, y_SPARK } from '../common';
import { PlayScriptBtn } from '../components/PlayScriptBtn';
import { delay, highlight } from '../common/highlight';
import { useEditor } from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';

export const CloneComponent: IEventDesc = {
  name: '克隆组件',
  category: '高级',
  link: 'https://magicplay.oceanengine.com/tutorials/middle/five',
  checkError: ({ url }) => {
    if (url === undefined) return '未设置目标组件';
    return '';
  },
  Summary: ({ props: { time, _editor } }) => {
    const { name } = (_editor as any) || {};
    return name ? (
      <>
        {delay(time)} 克隆 {highlight(name)}
      </>
    ) : (
      <>请选择组件</>
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
          spark: 'value',
          index: ['url', '_editor'],
          content([url, _editor = {}], onChange) {
            const { name } = _editor;
            return {
              spark: 'element',
              content() {
                return (
                  <ResourceBox
                    concise
                    url={url}
                    name={name}
                    type="Animation"
                    onChange={({ url: u = url, name: n = name }) => onChange([u, { ..._editor, name: n }])}
                  />
                );
              },
            };
          },
        },
        {
          spark: 'flex',
          content: [
            formulaSpark({ ...x_SPARK, label: 'X偏移', tooltip: '水平位置偏移' } as INumberSpark),
            formulaSpark({ ...y_SPARK, label: 'Y偏移', tooltip: '垂直位置偏移' } as INumberSpark),
          ],
        },
        {
          spark: 'check',
          index: '',
          check: {
            options: () => {
              const { enableBlueprint } = useEditor(0, 'enableBlueprint');

              return enableBlueprint
                ? PARENT_TYPE.filter(({ value }) => value !== 'target')
                : PARENT_TYPE.filter(({ value }) => value !== 'node');
            },
          },
          content: {
            index: 'parent',
            spark: 'select',
            label: '克隆到',
            defaultValue: 'scene',
            tooltip: '克隆到哪里',
            options: PARENT_TYPE,
            required: true,
          },
        },
        {
          spark: 'check',
          index: 'parent',
          check: {
            hidden: parent => parent !== 'node',
          },
          content: targetId_SPARK,
        },
        {
          spark: 'value',
          index: 'id',
          content(scriptId) {
            return {
              spark: 'element',
              content() {
                return <PlayScriptBtn id={scriptId} />;
              },
            };
          },
        },
      ],
    },
  },
};
