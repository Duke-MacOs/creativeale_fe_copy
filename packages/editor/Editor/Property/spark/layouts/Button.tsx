import { SparkFn } from '.';
import render, { ArrayCell, ICheckSpark, Spark } from '../../cells';
import { NodeCell } from './groups/customGroups/NodeCell';
import {
  extraSpark,
  headerGroup,
  textureGroup,
  layoutGroup,
  transformGroup,
  borderGroup,
  othersGroup,
  buttonJumpSceneGroup,
  sliderJumpSceneGroup,
} from './groups';

const filledGroup: SparkFn = (): ICheckSpark => {
  return {
    spark: 'check',
    index: 'url',
    check: {
      // 图片按钮有值，图形按钮为'', 多选时 url 为 undefined
      hidden: url => url !== '',
    },
    content: {
      spark: 'group',
      label: '填充',
      content: {
        spark: 'block',
        content: {
          spark: 'color',
          index: 'bgColor',
          label: '背景颜色',
          defaultValue: '#FFC367',
        },
      },
    },
  };
};

export const ButtonBase: SparkFn = (props, envs) => {
  const spark: Spark = {
    spark: 'grid',
    content: [extraSpark, headerGroup, textureGroup, filledGroup, borderGroup, transformGroup, layoutGroup]
      .filter(group => !envs.filter || envs.filter(group))
      .map(fn => fn(props, envs)),
  };
  return spark;
};

export const Button = ButtonBase;

export const PVButton: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      buttonJumpSceneGroup(props, envs),
      textureGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};
export const VRButton: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      buttonJumpSceneGroup(props, envs),
      textureGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};

export const PVDragger: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      buttonJumpSceneGroup(props, envs),
      textureGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};
export const PVGuider: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      headerGroup({ ...props, type: 'Sprite' }, envs),
      {
        spark: 'group',
        label: '引导设置',
        content: {
          spark: 'grid',
          content: [
            {
              spark: 'value',
              index: 'targets',
              content(targets = [], onChange) {
                return {
                  spark: 'element',
                  content: () => {
                    return (
                      <ArrayCell
                        label="被引导组件"
                        array={targets}
                        defaultExpanded
                        onChange={onChange}
                        render={(item, onChange) => {
                          return render({
                            spark: 'element',
                            content: () => {
                              return (
                                <NodeCell
                                  isType={type => ['PVButton', 'PVClickArea', 'PVSlider'].includes(type)}
                                  value={item}
                                  onChange={onChange}
                                />
                              );
                            },
                          });
                        }}
                      />
                    );
                  },
                };
              },
            },
            {
              spark: 'label',
              label: '开启全屏蒙层',
              content: {
                spark: 'boolean',
                index: 'withMask',
                defaultValue: false,
              },
            },
          ],
        },
      },
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};

export const PVClickArea: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      headerGroup(props, envs),
      buttonJumpSceneGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};

export const PVSlider: SparkFn = (props, envs) => {
  props = { ...props, type: 'Button' };
  return {
    spark: 'grid',
    content: [
      extraSpark(props, envs),
      headerGroup(props, envs),
      sliderJumpSceneGroup(props, envs),
      transformGroup(props, envs),
      othersGroup(props, envs),
    ],
  };
};
