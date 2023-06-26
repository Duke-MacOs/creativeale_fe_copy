import type { SparkFn } from '.';
import { shallowEqual, useSelector } from 'react-redux';
import { findById, getNodes, getScene, isAnimation } from '@editor/utils';
import { enabledSpark } from './groups/headerGroup/enabledSpark';
import { nameSpark } from './groups/headerGroup/nameSpark';

export const Controller: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'group',
        label: '控制器名称与内容',
        extra: enabledSpark(envs.isRoot),
        content: {
          spark: 'block',
          status: 'closed',
          content: {
            spark: 'grid',
            content: [
              nameSpark(props, envs),
              {
                spark: 'check',
                index: [],
                check: {
                  hidden: () => {
                    return useSelector(({ project }: EditorState) => {
                      const [node] = findById(getNodes(getScene(project)), props.id, true);
                      return node && !['Spine', 'DragonBones', 'Live2d', 'FrameAnime'].includes(node.type);
                    }, shallowEqual);
                  },
                },
                content: {
                  spark: 'value',
                  index: ['animName', 'name', 'duration'],
                  content([animName], onChange) {
                    const animations = useSelector(({ project }: EditorState) => {
                      return findById(getNodes(getScene(project)), props.id, true)[0]?.editor?.animations;
                    }, shallowEqual) ?? [['default', 1000]];
                    const options = animations.map(([value]) => ({ label: value, value }));
                    return {
                      spark: 'element',
                      content: render =>
                        render({
                          spark: 'select',
                          label: '动画片段',
                          tooltip: '指定要播放的动画片段',
                          value: animName,
                          options,
                          onChange: value => {
                            const [animName, duration] = animations.find(item => item[0] === value)!;
                            onChange([animName, animName, duration]);
                          },
                        }),
                    };
                  },
                },
              },
              {
                // Model 控制器的动画片段
                spark: 'check',
                index: 'layer',
                check: {
                  hidden: layerIdx => {
                    const layerAnimations =
                      useSelector(({ project }: EditorState) => {
                        return findById(getNodes(getScene(project)), props.id, true)[0]?.editor?.layerAnimations;
                      }, shallowEqual)?.[layerIdx] ?? [];

                    return layerAnimations.length === 0;
                  },
                },
                content: {
                  spark: 'value',
                  index: ['layer', 'animName', 'duration'],
                  content([layerIdx, animName], onChange) {
                    const layerAnimations =
                      useSelector(({ project }: EditorState) => {
                        return findById(getNodes(getScene(project)), props.id, true)[0]?.editor?.layerAnimations;
                      }, shallowEqual)?.[layerIdx] ?? [];
                    const options = layerAnimations.map(([value]) => ({ label: value, value }));
                    return {
                      spark: 'element',
                      content: render =>
                        render({
                          spark: 'select',
                          label: '动画片段',
                          tooltip: '指定要播放的动画片段',
                          value: animName,
                          options,
                          onChange: value => {
                            const [animName, duration] = layerAnimations.find(item => item[0] === value)!;
                            onChange([layerIdx, animName, duration]);
                          },
                        }),
                    };
                  },
                },
              },
              {
                spark: 'check',
                index: [],
                check: {
                  hidden: () => {
                    return useSelector(({ project }: EditorState) => {
                      const [node] = findById(getNodes(getScene(project)), props.id, true);
                      return node && !isAnimation(node.type);
                    }, shallowEqual);
                  },
                },
                content: {
                  spark: 'value',
                  index: ['stateId', 'name', 'duration'],
                  content([stateId], onChange) {
                    const state =
                      useSelector(({ project }: EditorState) => {
                        return findById(getNodes(getScene(project)), props.id, true)[0]?.editor?.state;
                      }, shallowEqual) ?? [];
                    const options = state.map(({ name, id }) => ({ label: name, value: id !== -1 ? id : undefined }));
                    return {
                      spark: 'element',
                      content: render =>
                        render({
                          spark: 'select',
                          label: '组件状态',
                          tooltip: '选择互动组件的状态',
                          value: stateId,
                          options,
                          onChange: stateId => {
                            const { name, duration = 0 } = state.find(item => item.id === (stateId ?? -1))!;
                            onChange([stateId, name, duration]);
                          },
                        }),
                    };
                  },
                },
              },
            ],
          },
        },
      },
      {
        spark: 'group',
        label: '播放',
        hidden: envs.typeOfPlay === 4,
        content: {
          spark: 'block',
          status: 'closed',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'label',
                tooltip: '是否循环播放',
                label: '循环播放',
                content: {
                  spark: 'boolean',
                  index: 'loop',
                  defaultValue: false,
                },
              },
              {
                spark: 'check',
                index: 'loop',
                check: {
                  hidden: (loop = false) => !loop,
                },
                content: {
                  spark: 'flex',
                  content: [
                    {
                      spark: 'number',
                      index: 'loopInterval',
                      label: '循环间隔',
                      tooltip: '每次循环的停顿间隔时间',
                      defaultValue: 0,
                      precision: 2,
                      ratio: -1000,
                      unit: 's',
                      step: 10,
                      min: 0,
                    },
                    {
                      index: 'loopTimes',
                      spark: 'number',
                      label: '循环次数',
                      defaultValue: -1,
                      tooltip: '循环次数，-1代表一直循环',
                      precision: 0,
                      unit: '次',
                      step: 1,
                      min: -1,
                    },
                  ],
                },
              },
              {
                spark: 'check',
                index: [],
                check: {
                  hidden: () => {
                    return useSelector(({ project }: EditorState) => {
                      const [node] = findById(getNodes(getScene(project)), props.id, true);
                      return node && !['FrameAnime'].includes(node.type);
                    }, shallowEqual);
                  },
                },
                content: {
                  spark: 'select',
                  label: '播放方式',
                  index: 'direction',
                  options: [
                    { label: '正序', value: 'normal' },
                    { label: '倒序', value: 'reverse' },
                    { label: '来回播放', value: 'pingpong' },
                  ],
                  defaultValue: 'normal',
                },
              },
            ],
          },
        },
      },
      {
        spark: 'group',
        label: '时间',
        hidden: envs.typeOfPlay === 4,
        content: {
          spark: 'block',
          status: 'closed',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                index: 'time',
                label: '开始时间',
                tooltip: '控制器的开始时间',
                defaultValue: 0,
                precision: 2,
                ratio: -1000,
                unit: 's',
                step: 10,
                min: 0,
              },
              {
                spark: 'label',
                label: '不受场景播放状态影响',
                tooltip:
                  '动画是否受场景播放状态影响，设置为开启后，即使当前场景停止播放，动画依然会继续运行，用来实现场景停止播放，但一些动画依然继续播放的效果',
                content: {
                  spark: 'boolean',
                  index: 'playBySelf',
                  defaultValue: false,
                },
              },
            ],
          },
        },
      },
    ],
  };
};
