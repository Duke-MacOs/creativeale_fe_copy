import { callValue, IBlockSpark } from '../../../../cells';

export const widthHeightSpark = (hidden = false): IBlockSpark => ({
  spark: 'block',
  hidden,
  content: {
    spark: 'value',
    index: ['width', 'height', '_editor'],
    content([width, height, editor], onChange) {
      const getOnChange =
        (index: 0 | 1): typeof onChange =>
        (valueOrFn, options) => {
          onChange(([width = 0, height = 0, editor]: any) => {
            const { lockedRatio = true } = editor || {};
            if (!lockedRatio || ((!width || !height) && width !== height)) {
              const values = [width, height, editor];
              values[index] = callValue(valueOrFn, values[index]);
              return values;
            } else if (width === height) {
              const value = callValue(valueOrFn, width);
              return [value, value, editor];
            } else if (index === 0) {
              const value = callValue(valueOrFn, width);
              return [value, Math.floor(height * (value / width)), editor];
            } else {
              const value = callValue(valueOrFn, height);
              return [Math.floor(width * (value / height)), value, editor];
            }
          }, options);
        };
      return {
        spark: 'flex',
        columnGap: 4,
        content: [
          {
            spark: 'element',
            grow: 1,
            content: render => {
              return render({
                spark: 'number',
                width: 32,
                label: '宽',
                min: 0,
                value: width,
                onChange: getOnChange(0),
              });
            },
          },
          {
            spark: 'element',
            basis: 'auto',
            content: render =>
              render({
                spark: 'boolean',
                type: 'locked',
                size: 'small',
                tabIndex: -1,
                value: editor?.lockedRatio ?? true,
                onChange: lockedRatio => {
                  onChange(([width, height, editor]: any) => [width, height, { ...editor, lockedRatio }], {
                    after: true,
                  });
                },
              }),
          },
          {
            spark: 'element',
            grow: 1,
            content: render => {
              return render({
                spark: 'number',
                width: 32,
                label: '高',
                min: 0,
                value: height,
                onChange: getOnChange(1),
              });
            },
          },
        ],
      };
    },
  },
});
