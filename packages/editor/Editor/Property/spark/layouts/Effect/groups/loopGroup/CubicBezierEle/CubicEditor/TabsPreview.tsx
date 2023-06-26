import { IOption } from '@riko-prop/interface';
import { css } from 'emotion';
import { CubicEditorProps } from '.';

export const ChildrenTabs = ({
  children,
  onItemClick,
  currentValue,
}: {
  children: IOption['children'];
  onItemClick: (item: NonNullable<Unpack<IOption['children']>>) => void;
  currentValue: CubicEditorProps['selVal'];
}) =>
  children ? (
    <div style={{ display: 'flex' }}>
      {children.map(item => {
        return (
          <div
            key={item.value}
            className={css(
              {
                paddingTop: '8px',
                margin: '0 8px',
                fontSize: '12px',
                lineHeight: '20px',
                color: '#999999',
                overflow: 'hidden',
                cursor: 'pointer',
              },
              item.value === currentValue
                ? { borderBottom: '1px solid #3955F6', color: '#3955F6' }
                : {
                    '&:hover': {
                      color: '#333',
                    },
                  }
            )}
            onClick={() => onItemClick(item)}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  ) : null;
