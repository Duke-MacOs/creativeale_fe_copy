import { useState, useRef, useEffect } from 'react';
import { css } from 'emotion';
import { InputRef, Popover, Tooltip, Switch, Input } from 'antd';
import { Add, DeleteOne, SwitchButton } from '@icon-park/react';
import { isBaseType, getTypeCN } from '@shared/utils';
import { TreeDataItem, DataType } from './VariableTree';
import { FieldBinaryOutlined, FieldStringOutlined } from '@ant-design/icons';

interface IVariableTreeInput {
  item: TreeDataItem;
  value: any;
  type?: 'key' | 'value';
  disabled?: boolean;
  prefix?: React.ReactNode;
  visibleSuffixNode?: boolean;
  lightTip?: boolean;
  onAdd: (type: DataType) => void;
  onFocus: (e: any) => void;
  onBlur: (vale: string, type: 'key' | 'value') => boolean;
}

export const PlusIcon = (props: { onAdd: (type: DataType) => void }) => {
  const { onAdd } = props;
  const [visible, setVisible] = useState<boolean>(false);

  const onAddVariable = (type: DataType) => {
    onAdd(type);
    setVisible(false);
  };

  const content = (
    <div>
      {[
        {
          type: 'number',
          text: '数字',
        },
        {
          type: 'string',
          text: '文本',
        },
        {
          type: 'boolean',
          text: '开关',
        },
        {
          type: 'object',
          text: '对象',
        },
        {
          type: 'array',
          text: '数组',
        },
      ].map((i: any) => (
        <p
          key={i.type}
          className={css({
            padding: '10px 15px',
            margin: '0',
            '&:hover': {
              cursor: 'pointer',
              background: '#f0f5ff',
            },
          })}
          onClick={() => {
            onAddVariable(i.type);
          }}
        >
          {i.text}
        </p>
      ))}
    </div>
  );

  return (
    <Popover
      overlayClassName={css({
        '.ant-popover-inner-content': {
          padding: 0,
        },
      })}
      content={content}
      trigger="click"
      placement="left"
      open={visible}
      onOpenChange={visible => setVisible(visible)}
    >
      <Add theme="outline" size="14" fill="#333" style={{ marginRight: '5px' }} />
    </Popover>
  );
};

export const VariableTreeBoolean = (props: { value: boolean; onSelect: (checked: boolean) => void }) => {
  const { value, onSelect } = props;
  return (
    <div style={{ paddingLeft: '12px', display: 'flex', alignItems: 'center' }}>
      <Tooltip placement="top" title="开关">
        <SwitchButton theme="outline" size="12" fill="#c1c1c1" />
      </Tooltip>
      <Switch
        style={{ marginLeft: '5px' }}
        checkedChildren="开启"
        unCheckedChildren="关闭"
        checked={value}
        onChange={onSelect}
        size="small"
      />
    </div>
  );
};

const VariableTreeInput = (props: IVariableTreeInput) => {
  const { item, value, type = 'value', disabled = false, prefix, lightTip = false, onFocus, onBlur } = props;
  const [valueSelf, setValueSelf] = useState();
  const inputRef = useRef<InputRef>(null);
  const [lightColor, setLightColor] = useState('transparent');

  const prevValueRef = useRef<any>(value);

  // 高亮提示数据变化
  useEffect(() => {
    if (lightTip) {
      setLightColor('pink');
      setTimeout(() => {
        setLightColor('transparent');
      }, 150);
    }
  }, [value]);

  useEffect(() => {
    setValueSelf(value);
  }, [value]);

  const onChange = (e: any) => {
    setValueSelf(e.target.value);
  };

  const onFocusSelf = (e: any) => {
    onFocus(e);
    prevValueRef.current = e.target.value;
  };

  const onBlurSelf = (e: any) => {
    const isValid = onBlur(e.target.value, type);
    if (!isValid) setValueSelf(prevValueRef.current);
  };

  const onPressEnter = () => {
    inputRef.current?.blur();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: lightColor }}>
      <Input
        id={item.id}
        key={item.id}
        ref={inputRef}
        style={{ padding: '5px' }}
        placeholder="Empty"
        bordered={false}
        value={valueSelf}
        disabled={disabled}
        prefix={prefix}
        onFocus={onFocusSelf}
        onBlur={onBlurSelf}
        onChange={onChange}
        onPressEnter={onPressEnter}
      />
    </div>
  );
};

interface IProps extends IVariableTreeInput {
  arrayIdx: number | undefined;
  onDelete: () => void;
  onFocusInput: (e: any) => void;
  onSelect: (checked: boolean) => void;
}

export const TreeNode = (props: IProps) => {
  const { item, arrayIdx, lightTip, onDelete, onBlur, onFocusInput, onAdd, onSelect } = props;
  const [visibleSuffix, setVisibleSuffix] = useState<boolean>(false);
  const visiblePlusIcon = !isBaseType(item.objectValue);

  const onMouseOver = () => {
    setVisibleSuffix(true);
  };

  const onMouseOut = () => {
    setVisibleSuffix(false);
  };

  const SuffixNode = () => (
    <div
      key={item.id}
      style={{
        position: 'absolute',
        right: '5px',
        top: '5px',
        zIndex: 99,
        visibility: visibleSuffix ? 'unset' : 'hidden',
      }}
      onMouseOver={onMouseOver}
    >
      {visiblePlusIcon && <PlusIcon onAdd={onAdd} />}

      <DeleteOne theme="outline" size="14" fill="#333" onClick={onDelete} />
    </div>
  );

  const valueInput = (() => {
    if (item.type === 'boolean') {
      return <VariableTreeBoolean value={item.objectValue} onSelect={onSelect} />;
    }
    if (isBaseType(item.objectValue))
      return (
        <VariableTreeInput
          item={item}
          value={item.objectValue}
          lightTip={lightTip}
          disabled={item.type === 'loop'}
          type="value"
          prefix={
            item.type === 'number' ? (
              <Tooltip placement="top" title="数字">
                <FieldBinaryOutlined style={{ color: '#c1c1c1' }} />
              </Tooltip>
            ) : (
              <Tooltip placement="top" title="文本">
                <FieldStringOutlined style={{ color: '#c1c1c1' }} />
              </Tooltip>
            )
          }
          onAdd={onAdd}
          onFocus={onFocusInput}
          onBlur={onBlur}
        />
      );
    return <Input placeholder="Borderless" bordered={false} value={getTypeCN(item.objectValue)} disabled={true} />;
  })();

  return (
    <div
      key={item.id}
      style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseOut}
    >
      <div style={{ width: '150px' }}>
        <VariableTreeInput
          item={item}
          value={arrayIdx ?? item.objectKey}
          type="key"
          disabled={arrayIdx !== undefined}
          visibleSuffixNode={true}
          onAdd={onAdd}
          onFocus={onFocusInput}
          onBlur={onBlur}
        />
      </div>
      <div style={{ width: '150px' }}>{valueInput}</div>
      <SuffixNode />
    </div>
  );
};
