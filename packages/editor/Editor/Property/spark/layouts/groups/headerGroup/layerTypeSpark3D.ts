import { IBlockSpark } from '../../../../cells';

export const LAYER_TYPE = [
  {
    label: 'Default',
    value: 'Default',
  },
  {
    label: 'TransparentFX',
    value: 'TransparentFX',
  },
  {
    label: 'Ignore Raycast',
    value: 'Ignore Raycast',
  },
  {
    label: 'Test',
    value: 'Test',
  },
  {
    label: 'Water',
    value: 'Water',
  },
  {
    label: 'UI',
    value: 'UI',
  },
];

export const layerTypeSpark3D = (hidden = true): IBlockSpark => {
  hidden = true;
  return {
    spark: 'block',
    hidden,
    content: {
      spark: 'select',
      index: 'layer',
      label: '层',
      tooltip: '用于分组的节点所属层',
      defaultValue: 'Default',
      options: LAYER_TYPE,
    },
  };
};
