import { INumberSpark } from '@editor/Editor/Property/cells';
import { formulaSpark } from '../../../../common/formulaSpark';
import { EFFECT_TYPE, PARENT_TYPE } from '../../../../constants';
import { ResourceBox } from '../../../groups/resourceSpark/ResourceBox';
import {
  duration_SPARK,
  IEventDesc,
  scaleX_SPARK,
  scaleY_SPARK,
  targetId_SPARK,
  time_SPARK,
  x_SPARK,
  y_SPARK,
} from '../common';
import { PlayScriptBtn } from '../components/PlayScriptBtn';
import { delay, highlight } from '../common/highlight';
import { omit } from 'lodash';
import { useEditor } from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';

export const PlayEffect: IEventDesc = {
  name: '播放动效',
  category: '常用',
  checkError({ url }) {
    if (url === undefined) return '未设置动效';
    return '';
  },
  Summary: ({ props: { time, _editor } }) => {
    const { name } = (_editor as any) || {};
    return name ? (
      <>
        {delay(time)} 播放 {highlight(name)}
      </>
    ) : (
      <>未设置动效</>
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
            spark: 'value',
            index: ['effectType', 'url', '_editor'],
            defaultValue: ['Particle'],
            required: true,
            content([effectType, url, _editor = {}], onChange) {
              const { name, cover } = _editor;
              return {
                spark: 'grid',
                content: [
                  {
                    spark: 'element',
                    content: render =>
                      render({
                        spark: 'select',
                        label: '动效类型',
                        tooltip: '动效类型',
                        options: EFFECT_TYPE,
                        value: effectType,
                        onChange(value) {
                          onChange([value, undefined, omit(_editor, 'name', 'cover')]);
                        },
                      }),
                  },
                  {
                    spark: 'element',
                    content() {
                      return (
                        <ResourceBox
                          type={effectType}
                          cover={cover}
                          name={name}
                          url={url}
                          concise
                          onChange={({ url, name, cover }) => {
                            onChange([effectType, url, { ..._editor, name, cover }]);
                          }}
                        />
                      );
                    },
                  },
                ],
              };
            },
          },
        },
        formulaSpark({
          ...duration_SPARK,
          defaultValue: 2000,
          tooltip: '最大播放持续时长，如果动效本身时长过长则直接剪掉',
        } as INumberSpark),
        {
          spark: 'flex',
          content: [
            formulaSpark({ ...x_SPARK, label: '水平位置偏移', tooltip: '水平位置偏移' } as INumberSpark),
            formulaSpark({ ...y_SPARK, label: '垂直位置偏移', tooltip: '垂直位置偏移' } as INumberSpark),
          ],
        },
        {
          spark: 'flex',
          content: [formulaSpark(scaleX_SPARK), formulaSpark(scaleY_SPARK)],
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
