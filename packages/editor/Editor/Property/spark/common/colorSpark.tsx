import tinycolor2 from 'tinycolor2';
import { IColorSpark } from '../../cells';
import { withModel } from '../../cells/utils/withModel';

export const colorSpark = (
  content: Omit<IColorSpark, 'defaultValue'> & {
    defaultValue: IColorSpark['defaultValue'] | [number, number, number, number?];
  }
) =>
  withModel(
    content,
    ({
      value,
      onChange,
    }: {
      value: string | [number, number, number, number?];
      onChange: (value: string | [number, number, number, number?]) => void;
    }) => {
      const { color, isVector } = vectorToRgbString(value);
      return {
        value: color,
        onChange(rgb: string) {
          onChange(rgbStringToVector(rgb, isVector));
        },
      };
    }
  );

function vectorToRgbString(color: string | [number, number, number, number?]): {
  color: string;
  isVector: boolean;
} {
  if (Array.isArray(color)) {
    return {
      isVector: true,
      color: tinycolor2
        .fromRatio(
          Object.fromEntries(color.map((value, index) => [['r', 'g', 'b', 'a'][index], value])) as {
            r: number;
            g: number;
            b: number;
            a?: number;
          }
        )
        .toRgbString(),
    };
  }
  return {
    isVector: false,
    color,
  };
}

function rgbStringToVector(color: string, isVector: boolean): string | [number, number, number, number?] {
  if (isVector) {
    return Object.values(tinycolor2(color).toPercentageRgb()).map(value =>
      typeof value === 'number' ? value : Number(value.replace('%', '')) / 100
    ) as any;
  }
  return tinycolor2(color).toRgbString();
}
