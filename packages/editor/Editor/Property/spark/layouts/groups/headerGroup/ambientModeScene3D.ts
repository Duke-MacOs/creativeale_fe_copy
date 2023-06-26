import { IEnterSpark, IGridSpark } from '../../../../cells';
import { colorSpark } from '../../../common/colorSpark';

export const ambientModeScene3D = (): IGridSpark => {
  return {
    spark: 'grid',
    content: [
      {
        spark: 'select',
        label: '环境模式',
        index: 'ambientMode',
        defaultValue: 1,
        options: [
          {
            label: '颜色',
            value: 0,
          },
          {
            label: '天空盒',
            value: 1,
          },
        ],
      },
      {
        spark: 'check',
        index: 'ambientMode',
        check: { hidden: ambientMode => ambientMode === 1 },
        content: colorSpark({
          spark: 'color',
          index: 'ambientColor',
          label: '环境光颜色',
          defaultValue: [54, 58, 66],
        }),
      },
      {
        spark: 'check',
        index: 'ambientMode',
        check: { hidden: ambientMode => ambientMode === 0 },
        content: {
          spark: 'label',
          label: '强度',
          content: {
            spark: 'slider',
            index: 'ambientSphericalHarmonicsIntensity',
            defaultValue: 1,
            min: 0,
            max: 8,
            step: 0.03,
            precision: 2,
            inputNumber: true,
          },
        },
      },
    ],
  };
};

export const enterVector = (index: string, label = ['X', 'Y', 'Z']): IEnterSpark => {
  return {
    spark: 'enter',
    index,
    content: {
      spark: 'flex',
      content: [
        {
          spark: 'number',
          label: label[0],
          width: 16,
          index: 0,
          defaultValue: 0,
          step: 0.1,
          precision: 1,
        },
        {
          spark: 'number',
          label: label[1],
          width: 16,
          index: 1,
          defaultValue: 0,
          step: 0.1,
          precision: 1,
        },
        {
          spark: 'number',
          label: label[2],
          width: 16,
          index: 2,
          defaultValue: 0,
          step: 0.1,
          precision: 1,
        },
      ],
    },
  };
};
