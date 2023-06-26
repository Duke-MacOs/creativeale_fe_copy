import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import Icon, { PlusOutlined } from '@ant-design/icons';
import { Drag, Down, Up, DeleteOne } from '@icon-park/react';
import { arrayMoveImmutable } from 'array-move';
import { useCurrent } from '../utils';
import { isFunction } from 'lodash';
import { useState } from 'react';
import { Button } from 'antd';
import { css } from 'emotion';

export interface ArrayCellProps<T = any> {
  array: T[];
  onChange: (array: T[], options?: any, oldIndex?: number, newIndex?: number) => void;
  render: (item: T, onChange: (item: T, options?: any) => void, index: number) => React.ReactNode;

  label?: string;
  labelRender?: (item: T) => React.ReactNode;
  defaultExpanded?: boolean;
  sortable?: boolean;
  deletable?: boolean;
  addable?: boolean;
  addButtonProps?: {
    block: boolean;
  };
  defaultItem?: ((onAdd: (item: T) => void) => void) | T;
  onDelete?: (arg: T) => void;
  onSelect?: (index: number) => void;
  minLength?: number;
  maxLength?: number;
}

export const ArrayCell = <T,>(props: ArrayCellProps<T>) => {
  return (
    <List
      {...props}
      useDragHandle
      lockAxis="y"
      distance={4}
      helperClass={css({ zIndex: 2 })}
      onSortEnd={({ oldIndex, newIndex }) => {
        props.onChange(arrayMoveImmutable(props.array, oldIndex, newIndex), {}, oldIndex, newIndex);
      }}
    />
  );
};

const List = SortableContainer(
  ({
    array,
    label,
    labelRender,
    minLength,
    maxLength,
    defaultItem,
    sortable,
    addable = true,
    addButtonProps,
    deletable = true,
    defaultExpanded = false,
    render,
    onChange,
    onDelete,
    onSelect,
  }: ArrayCellProps) => {
    const onAdd = useCurrent((item: any) => onChange(array.concat([item])));
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    return (
      <div>
        {array.map((item, index) => {
          const content = render(
            item,
            (item, options) => {
              onChange(
                array.map((e, i) => (i === index ? item : e)),
                options
              );
            },
            index
          );
          return (
            content && (
              <Item
                key={index}
                index={index}
                sortable={sortable}
                deletable={deletable && (!minLength || array.length > minLength)}
                defaultExpanded={defaultExpanded || index === array.length - 1}
                label={labelRender ? labelRender(item) : `${label} ${index + 1}`}
                onDelete={() => {
                  if (onDelete) {
                    onDelete?.(array[index]);
                  } else {
                    onChange(array.filter((_, i) => i !== index));
                  }
                }}
                selectedIndex={selectedIndex}
                onSelect={() => {
                  setSelectedIndex(index);
                  onSelect?.(index);
                }}
              >
                {content}
              </Item>
            )
          );
        })}
        {addable && (
          <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'center' }}>
            <Button
              ghost
              block={addButtonProps?.block ?? true}
              type="primary"
              disabled={array.length >= (maxLength ?? Number.MAX_SAFE_INTEGER)}
              onClick={() => {
                if (isFunction(defaultItem)) {
                  defaultItem((item: any) => onAdd.current(item));
                } else {
                  onAdd.current(defaultItem);
                }
              }}
            >
              <PlusOutlined style={{ fontSize: 16 }} />
              <span style={{ lineHeight: '20px' }}>
                {label} {maxLength ? `（${array.length}/${maxLength}）` : ''}
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  }
);

const Item = SortableElement(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ label, children, deletable, sortable = true, onDelete, selectedIndex, onSelect, defaultExpanded }: any) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    return (
      <div
        className={css({
          background: 'rgb(250, 250, 250)',
          padding: expanded ? '8px 12px' : '8px 12px 0',
          borderRadius: 4,
          marginBottom: 16,
        })}
        onClick={() => {
          onSelect();
        }}
      >
        <div className={css({ display: 'flex', alignItems: 'center', paddingBottom: 8 })}>
          {sortable && <Handle />}
          <div className={css({ flex: 'auto', cursor: 'pointer' })} onClick={() => setExpanded(!expanded)}>
            {label} <Icon component={(expanded ? Down : Up) as any} />
          </div>
          {deletable && (
            <Button
              size="small"
              type="text"
              icon={<DeleteOne style={{ fontSize: 16, lineHeight: 0 }} />}
              onClick={onDelete}
            />
          )}
        </div>
        {expanded && <div>{children}</div>}
      </div>
    );
  }
);

const Handle = SortableHandle(() => {
  return (
    <Button
      type="text"
      icon={<Icon component={Drag as any} />}
      className={css({ flex: 'none', cursor: 'row-resize' })}
    />
  );
});
