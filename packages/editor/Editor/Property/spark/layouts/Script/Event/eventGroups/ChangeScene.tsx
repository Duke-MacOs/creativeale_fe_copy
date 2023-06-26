import store from '@editor/aStore';
import { useEnableBlueprint } from '@editor/Editor/Blueprint/hooks';
import { checkSpark } from '@editor/Editor/Property/spark/common/checkSpark';
import { formulaSpark } from '../../../../common/formulaSpark';
import { sceneSelectSpark, useSceneOptions } from '../../../../common/sceneSelectSpark';
import { DIRECTION_TYPE, TRANSITION_TYPE } from '../../../../constants';
import { IEventDesc, time_SPARK } from '../common';
import { delay, highlight } from '../common/highlight';

export const ChangeScene: IEventDesc = {
  name: '切换场景',
  category: '常用',
  checkError: ({ sceneId }) => {
    const state = store.getState().project;
    if (typeof sceneId !== 'number') {
      return '未设置切换目标场景';
    }
    if (sceneId > 0 && state.scenes.every(({ type, orderId }) => type !== 'Scene' || orderId !== sceneId)) {
      return '切换目标场景不存在';
    }
    return '';
  },
  Summary: ({ props }) => {
    const { time, sceneId } = props;
    const sceneOptions = useSceneOptions();
    const scene = sceneOptions.find(scene => scene.value === sceneId);

    return (
      <>
        {delay(time)} 切换至 {highlight(scene?.label)}
      </>
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
        sceneSelectSpark({
          spark: 'select',
          index: 'sceneId',
          label: '切换至',
          tooltip: '切换至某个场景',
          placeholder: '请选择',
          defaultValue: undefined,
          required: true,
        }),
        {
          spark: 'value',
          index: ['destroyLastScene', 'relation'],
          content([destroy = true, relation = 1], onChange) {
            const options = [
              { label: '替换当前场景', value: [true, 1] },
              { label: '叠加到顶层', value: [false, 0] },
              { label: '叠加到上面', value: [false, 1] },
              { label: '叠加到下面', value: [false, 2] },
            ];
            return {
              spark: 'element',
              content: render =>
                render({
                  spark: 'select',
                  label: '切换方式',
                  value: options.findIndex(({ value: [d, r] }) => d === destroy && r === relation),
                  options: options.map(({ label }, value) => ({ label, value })),
                  onChange(index, opts) {
                    onChange(options[index as number].value, opts);
                  },
                }),
            };
          },
        },
        {
          spark: 'select',
          index: 'transition',
          label: '转场效果',
          tooltip: '转场效果',
          defaultValue: 'none',
          options: TRANSITION_TYPE,
          required: true,
        },
        {
          spark: 'check',
          index: 'transition',
          check: {
            hidden: value => value !== 'move',
          },
          content: {
            spark: 'select',
            index: 'direction',
            label: '滑入方向',
            tooltip: '滑入方向',
            defaultValue: 'right',
            options: DIRECTION_TYPE,
          },
        },
      ],
    },
  },
};
