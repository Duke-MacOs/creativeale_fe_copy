import { IGroupSpark } from '@editor/Editor/Property/cells';
import { EffectFn } from '../..';
import { Vector } from '../../../groups/customGroups/vector';
export const amplitudeVectorGroup: EffectFn = (): IGroupSpark => {
  return {
    spark: 'group',
    label: '振动',
    content: {
      spark: 'value',
      index: 'amplitudeVector',
      content(value, onChange) {
        return {
          spark: 'element',
          content() {
            return <Vector value={value} onChange={onChange} label="振幅" steps={[0.1, 0.1, 0.1]} />;
          },
        };
      },
    },
  };
};
