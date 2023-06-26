import { Table, Checkbox, Input, InputRef } from 'antd';
import Icon from '@ant-design/icons';
import { css } from 'emotion';
import { useEffect } from 'react';
import { useRef, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { useLayer } from './hooks';
import { DeleteOne } from '@icon-park/react';

interface IEditableTable {
  idx: string;
  initialValue: string;
  hasDelete: boolean;
  onSave: (name: string) => void;
  onDelete: () => void;
}

const isValidName = (name: string) => {
  return name !== '';
};

const EditableTable = ({ idx, initialValue, hasDelete, onSave, onDelete }: IEditableTable) => {
  const [value, setValue] = useState(initialValue);
  const [focus, setFocus] = useState(false);
  const [visibleDelete, setVisibleDelete] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  useEffect(() => {
    if (inputRef.current) {
      focus ? inputRef.current.focus() : inputRef.current.blur();
    }
  }, [focus]);
  return (
    <div
      style={{
        width: '100px',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseLeave={() => {
        setVisibleDelete(false);
      }}
      onMouseEnter={() => {
        setVisibleDelete(true);
      }}
    >
      <Input
        ref={inputRef}
        prefix={<span style={{ color: 'gray', fontSize: '11px' }}>{idx}</span>}
        style={{
          marginRight: '3px',
          width: '80px',
        }}
        value={value}
        bordered={focus}
        status={value === '' ? 'error' : ''}
        placeholder="不能为空"
        onChange={onChange}
        onPressEnter={() => {
          const name = inputRef.current?.input?.value ?? '碰撞组';
          if (isValidName(name)) {
            onSave(name);
            setFocus(false);
          }
        }}
        onBlur={() => {
          const name = inputRef.current?.input?.value ?? '碰撞组';
          isValidName(name) ? onSave(name) : setValue(initialValue);
          setFocus(false);
        }}
        onFocus={() => {
          setFocus(true);
        }}
      />
      {visibleDelete && hasDelete && <Icon component={DeleteOne as any} onClick={onDelete} />}
    </div>
  );
};

export default function () {
  const { updateName, updateCollisions, deleteCollision, resetLayer } = useLayer();

  (window as any).resetLayer = resetLayer;

  const { layerCollisions = {}, layerCollisionName = [] } = useSelector(({ project: { settings } }: EditorState) => {
    return { layerCollisions: settings.layerCollisions, layerCollisionName: settings.layerCollisionName };
  }, shallowEqual);

  const onChangeName = (params: { key: string; name: string }, idx: number) => {
    updateName(params, idx);
  };

  const getOnChange = (key: string, changeKey: string, originCollisions: number[]) => {
    return (e: any) => {
      if (e.target.checked) {
        originCollisions.push(Number(changeKey));
      } else {
        originCollisions = originCollisions.filter(i => i !== Number(changeKey));
      }
      updateCollisions(key, [...originCollisions]);
    };
  };

  const columns: any = [
    {
      title: '',
      width: '110px',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      ellipsis: true,
      render(params: { name: string; key: string }, row: any, idx: number) {
        const { name, key } = params;
        return (
          <EditableTable
            idx={key}
            initialValue={name}
            hasDelete={key !== '0'}
            onSave={(name: string) => {
              onChangeName({ ...params, name }, idx);
            }}
            onDelete={() => {
              deleteCollision(key);
            }}
          />
        );
      },
    },
    ...layerCollisionName?.map(({ name, key }, idx) => ({
      title: name,
      width: '80px',
      dataIndex: `col${key}`,
      ellipsis: true,
      key: idx,
      render: (props: any) => {
        return props.disabled ? '-' : <Checkbox {...props} />;
      },
    })),
  ];

  const data: any = [];
  for (let i = 0; i < layerCollisionName.length; i++) {
    const { key, name } = layerCollisionName[i];
    const item: any = {
      key,
      name: { name, key },
    };
    const checkedList = layerCollisions[key];
    layerCollisionName?.forEach(({ key: changeKey }, idx: number) => {
      item[`col${changeKey}`] = {
        disabled: idx > i,
        checked: checkedList?.includes(Number(changeKey)),
        onChange: getOnChange(key, changeKey, checkedList),
      };
    });
    data.push(item);
  }

  return (
    <Table
      className={css({
        '.ant-input': {
          fontSize: '12px',
          padding: '4px 6px',
        },
        '.ant-table': {
          fontSize: '12px',
        },
        '.ant-table-tbody > tr > td, .ant-table-thead > tr > th': {
          padding: '12px',
          textAlign: 'center',
          fontWeight: 'unset',
        },
        '.ant-table-tbody > tr > td': {
          padding: '12px 4px',
        },
      })}
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ x: '100%', y: 500 }}
    />
  );
}
