import { IBooleanSpark, INumberSpark, IStringSpark, ISelectSpark, ISliderSpark, IColorSpark, IValueSpark } from '..';

export function withModel<
  T extends Omit<
    IBooleanSpark | INumberSpark | IStringSpark | ISelectSpark | ISliderSpark | IColorSpark,
    'defaultValue'
  > & {
    defaultValue: any;
  },
  U = (IBooleanSpark | INumberSpark | IStringSpark | ISelectSpark | ISliderSpark | IColorSpark)['defaultValue']
>(
  spark: T,
  model: ({ value, onChange }: { value: any; onChange: (value: any) => void }) => {
    value: U;
    onChange: (value: U) => void;
  }
): IValueSpark {
  const { defaultValue, ...rest } = spark;
  return {
    spark: 'value',
    index: spark.index,
    content(value, onChange) {
      return {
        spark: 'element',
        content(render) {
          return render({
            ...rest,
            ...model({ value: value ?? defaultValue, onChange }),
          } as any);
        },
      };
    },
  };
}
