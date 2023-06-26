import render, { getIndexer, Spark } from '@editor/Editor/Property/cells';
import { colorSpark } from '../../../common/colorSpark';

export function TextBox({ value = { props: {} }, onChange }: any) {
  return render({
    spark: 'context',
    provide: () => ({
      useValue(index) {
        const { indexValue, indexEntries } = getIndexer(index);
        return {
          value: [indexValue(value.props)],
          onChange([props]) {
            onChange({ ...value, props: { ...value.props, ...Object.fromEntries(indexEntries(props)) } });
          },
        };
      },
    }),
    content: {
      spark: 'block',
      content: {
        spark: 'grid',
        content: [
          {
            spark: 'string',
            index: 'text',
            label: '文本',
          },
          {
            spark: 'number',
            index: 'fontSize',
            defaultValue: 50,
            label: '字号',
            min: 8,
            max: 160,
          },
          colorSpark({
            spark: 'color',
            index: 'color',
            label: '颜色',
            defaultValue: '#000',
          }),
        ],
      },
    },
  } as Spark);
}
