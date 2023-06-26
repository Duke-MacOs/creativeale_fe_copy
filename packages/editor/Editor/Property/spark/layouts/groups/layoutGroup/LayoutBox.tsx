import { theme } from 'antd';
import { css, cx } from 'emotion';

export const LayoutBox = ({ values, onChange }: { values: any[]; onChange(index: number, checked: any): void }) => {
  const { token } = theme.useToken();
  return (
    <div
      className={css({
        border: `1px solid ${token.colorBorderSecondary}`,
        flexDirection: 'column',
        display: 'flex',
        height: 80,
        width: 80,
      })}
    >
      <div className={cx(className, class2)}>
        <CheckBox vertical checked={values[0]} onChecked={checked => onChange(0, checked)} />
      </div>
      <div style={{ alignItems: 'stretch' }} className={cx(className, class3)}>
        <div className={cx(className, class2)}>
          <CheckBox checked={values[3]} onChecked={checked => onChange(3, checked)} />
        </div>
        <div
          className={cx(
            className,
            class3,
            css({
              border: '1px solid black',
              position: 'relative',
              '>div': {
                position: 'absolute',
              },
            })
          )}
        >
          <CheckBox checked={values[4]} onChecked={checked => onChange(4, checked)} />
          <CheckBox vertical checked={values[1]} onChecked={checked => onChange(1, checked)} />
        </div>
        <div className={cx(className, class2)}>
          <CheckBox checked={values[5]} onChecked={checked => onChange(5, checked)} />
        </div>
      </div>
      <div className={cx(className, class2)}>
        <CheckBox vertical checked={values[2]} onChecked={checked => onChange(2, checked)} />
      </div>
    </div>
  );
};

const className = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const class2 = css({
  flex: '1 1 0px',
});

const class3 = css({
  flex: '2 2 0px',
});

const CheckBox = ({
  checked,
  vertical,
  onChecked,
}: {
  checked?: boolean;
  vertical?: boolean;
  onChecked(checked: boolean): void;
}) => {
  const { token } = theme.useToken();
  return (
    <div
      className={cx(
        css({
          padding: '4px 3px',
          ':hover': {
            background: token.colorPrimaryBg,
          },
        }),
        vertical && css({ transform: 'rotate(90deg)' })
      )}
      onClick={() => {
        onChecked(!checked);
      }}
    >
      <div
        className={cx(
          css({ width: 12, height: 1, background: token.colorText }),
          checked && css({ height: 3, background: token.colorPrimary })
        )}
      />
    </div>
  );
};
