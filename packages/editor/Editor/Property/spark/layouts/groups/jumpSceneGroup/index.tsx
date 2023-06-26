import { IGroupSpark, ICheckSpark } from '../../../../cells';
import type { SparkFn } from '../..';
import { sceneSelectSpark } from '../../../common/sceneSelectSpark';
import { useSelector } from 'react-redux';
import { getScene } from '@editor/utils';
import { ResourceBox } from '../resourceSpark/ResourceBox';
import { NodeCell } from '../customGroups/NodeCell';

export const buttonJumpSceneGroup: SparkFn = (props, ...args): IGroupSpark => {
  return {
    spark: 'group',
    label: '互动跳转设置',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'value',
          index: 'target',
          hidden: props.type !== 'PVDragger',
          content(target, onChangeTarget) {
            return {
              spark: 'element',
              content: () => {
                return (
                  <NodeCell
                    value={target}
                    label="拖拽目标"
                    isType={type =>
                      !['PVButton', 'PVClickArea', 'PVSlider', 'PVDragger', 'PVAlphaVideo', 'VRButton'].includes(type)
                    }
                    onChange={onChangeTarget}
                  />
                );
              },
            };
          },
        },
        {
          spark: 'select',
          hidden: props.type !== 'PVClickArea',
          index: 'shapeType',
          label: '热区图形',
          tooltip: '热区图形设置',
          placeholder: '请选择',
          options: [
            { label: '圆形', value: 'circle' },
            { label: '矩形', value: 'rectangle' },
          ],
          defaultValue: 'circle',
          required: true,
        },
        sceneSelectSpark({
          spark: 'select',
          index: 'jumpSceneId',
          label: '跳转至',
          tooltip: '跳转至某个视频场景',
          placeholder: '请选择',
          defaultValue: undefined,
          required: true,
        }),
        jumpSettings(props, ...args),
      ],
    },
  };
};
export const sliderJumpSceneGroup: SparkFn = (...args): IGroupSpark => {
  return {
    spark: 'group',
    label: '互动跳转设置',
    content: {
      spark: 'grid',
      content: [
        sceneSelectSpark({
          spark: 'select',
          index: 'jumpSceneId',
          label: '跳转至',
          tooltip: '跳转至某个视频场景',
          placeholder: '请选择',
          defaultValue: undefined,
          required: true,
        }),
        {
          spark: 'select',
          index: 'gestureType',
          label: '滑动方向',
          tooltip: '滑动方向',
          defaultValue: 1,
          cols: 3,
          options: [
            { label: '左滑', value: 0 },
            { label: '右滑', value: 1 },
            { label: '上滑', value: 2 },
            { label: '下滑', value: 3 },
          ],
          required: true,
        },
        {
          spark: 'number',
          index: 'distance',
          label: '滑动长度',
          step: 1,
          cols: 3,
          precision: 0,
          defaultValue: 100,
          tooltip: '滑动的长度',
          min: 0,
        },
        {
          spark: 'slider',
          index: 'minRate',
          width: 96,
          label: '滑动生效长度',
          min: 0,
          max: 1,
          step: 0.01,
          ratio: 100,
          precision: 0,
          defaultValue: 1,
          unit: '%',
          tooltip: '滑动成功触发比率',
        },
        jumpSettings(...args),
      ],
    },
  };
};

const jumpSettings: SparkFn = () => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'select',
        index: 'guideTitle',
        label: '引导动作',
        tooltip: '手势引导该组件时，给用户的操作提示',
        options: [{ value: '点击' }, { value: '滑动' }, { value: '拖拽' }],
      },
      { spark: 'string', index: 'guideSubtitle', label: '引导文案', tooltip: '手势引导该组件时，给用户的效果提示' },
      {
        spark: 'label',
        label: '震动反馈',
        tooltip: '该组件触发后是否要给用户震动反馈',
        content: { spark: 'boolean', index: 'vibrating', defaultValue: false },
      },
    ],
  };
};

export const videoJumpSceneGroup: SparkFn = (): ICheckSpark => {
  return {
    spark: 'check',
    index: [],
    check: {
      hidden: () =>
        useSelector(({ project }: EditorState) =>
          Object.values(getScene(project).props).some(
            ({ jumpSceneId, type }) => type !== 'PVVideo' && type !== 'VRVideo' && typeof jumpSceneId === 'number'
          )
        ),
    },
    content: {
      spark: 'group',
      label: '自动跳转设置',
      content: sceneSelectSpark({
        spark: 'select',
        index: 'jumpSceneId',
        label: '跳转至',
        tooltip: '跳转至某个视频场景',
        placeholder: '请选择',
        defaultValue: undefined,
      }),
    },
  };
};

export const videoSoundUrlGroup: SparkFn = (props): ICheckSpark => {
  return {
    spark: 'check',
    index: [],
    check: {
      hidden: () =>
        !useSelector(({ project }: EditorState) =>
          Object.values(getScene(project).props).some(
            ({ jumpSceneId, type }) => type !== 'PVVideo' && typeof jumpSceneId === 'number'
          )
        ),
    },
    content: {
      spark: 'group',
      label: '背景音乐设置',
      content: {
        spark: 'value',
        index: ['soundUrl', '_editor'],
        content([url, editor = {}], onChange) {
          return {
            spark: 'element',
            content() {
              return (
                <ResourceBox
                  deletable={true}
                  {...props}
                  type="Sound"
                  url={url}
                  name={url ? editor.name : undefined}
                  size={editor.size}
                  onChange={({ url, name, size }) => {
                    onChange([url, { ...editor, name, size }]);
                  }}
                />
              );
            },
          };
        },
      },
    },
  };
};
