import { IGroupSpark } from '@editor/Editor/Property/cells';
import { merge } from 'lodash';
import { EffectFn } from '../../..';
import { CubicBezierEle } from './CubicBezierEle';

const DefaultConfig = {
  loop: {
    hidden: false,
    defaultValue: false,
  },
  ease: {
    hidden: false,
  },
  hasFadeEffect: {
    hidden: false,
    defaultValue: false,
  },
};

export const loopGroup: EffectFn = (props, envs, specialConfig = {}): IGroupSpark => {
  const config = merge({}, DefaultConfig, specialConfig);
  return {
    spark: 'group',
    label: '循环与过渡效果',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '循环播放',
          tooltip: '是否循环播放',
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
            hidden: loop => !loop,
          },
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'number',
                index: 'loopInterval',
                label: '循环间隔',
                cols: 3,
                defaultValue: 0,
                tooltip: '每次循环的停顿间隔时间',
                min: 0,
                step: 10,
                precision: 2,
                unit: 's',
                ratio: -1000,
              },
              {
                spark: 'number',
                index: 'loopTimes',
                label: '循环次数',
                cols: 3,
                tooltip: '循环次数，-1代表一直循环',
                min: -1,
                defaultValue: -1,
                precision: 0,
              },
            ],
          },
        },
        {
          spark: 'value',
          index: 'ease',
          hidden: config.ease.hidden,
          content(ease, onChange) {
            return {
              spark: 'element',
              content() {
                return <CubicBezierEle value={ease} onChange={onChange} />;
              },
            };
          },
        },
        {
          spark: 'label',
          label: '透明度渐变',
          width: 90,
          tooltip: '是否叠加渐变效果',
          hidden: config.hasFadeEffect.hidden,
          content: {
            spark: 'boolean',
            index: 'hasFadeEffect',
            defaultValue: true,
          },
        },
      ],
    },
  };
};
