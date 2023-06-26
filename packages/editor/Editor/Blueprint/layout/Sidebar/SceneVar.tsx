import { changeProps } from '@editor/aStore';
import render, { Spark, withContext } from '@editor/Editor/Property/cells';
import { getScene, neverThrow } from '@editor/utils';
import { Button, Divider, Space, Tooltip } from 'antd';
import { css } from 'emotion';
import { useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { Vector } from '@editor/Editor/Property/spark/layouts/groups/customGroups/vector';
import { message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

type IValue = string | number | boolean | Array<number>;
type IType = (
  | {
      type: 'string';
      value: string;
    }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'Vector3'; value: [number, number, number] }
  | { type: 'Vector4'; value: [number, number, number, number] }
) & {
  key: string;
};

export function SceneVar() {
  const { getState, dispatch } = useStore<EditorState>();
  const sceneData = useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    return (scene.props[scene.id].sceneData || {}) as Record<string, IType['value']>;
  }, shallowEqual);

  return (
    <div
      className={css({
        padding: '10px',
      })}
    >
      <ItemList
        value={sceneData}
        onChange={sceneData => {
          dispatch(
            changeProps([getScene(getState().project).id], {
              sceneData,
            })
          );
        }}
      />
      <AddBtn
        onAddItem={({ key, value }) => {
          if (!key) {
            throw new Error('场景变量名不能为空');
          }
          if (Object.keys(sceneData).includes(key)) {
            throw new Error('已存在该场景变量');
          }

          dispatch(
            changeProps([getScene(getState().project).id], {
              sceneData: Object.assign({}, sceneData, { [key]: value }),
            })
          );
        }}
      />
    </div>
  );
}

function ItemList<T extends Record<string, IValue>>({ value, onChange }: { value: T; onChange: (value: T) => void }) {
  return (
    <div>
      {Object.entries(value).map((entries, index) => {
        return (
          <div
            key={index}
            className={css({
              marginBottom: 20,
            })}
          >
            <Item
              value={entries}
              onChange={newEntries => {
                onChange(Object.fromEntries(Object.entries(value).map((v, i) => (i === index ? newEntries : v))) as T);
              }}
              onDelete={() => {
                onChange(Object.fromEntries(Object.entries(value).filter((_, i) => i !== index)) as T);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function Item<T extends [string, IValue]>({
  value,
  onChange,
  onDelete,
}: {
  value: T;
  onChange: (value: T) => void;
  onDelete: () => void;
}) {
  const [_, v] = value;
  return (
    <Space>
      {render(
        withContext(value, onChange, {
          spark: 'flex',
          content: [
            {
              spark: 'string',
              index: 0,
              label: '名称',
              width: 48,
              required: true,
              grow: 1,
            },
            ['string', 'number', 'boolean'].includes(typeof v) && {
              spark: typeof v as any,
              index: 1,
              width: 48,
              label: '值',
              grow: 1,
            },
            Array.isArray(v) && {
              spark: 'value',
              index: 1,
              grow: 2,
              content(value: any, onChange: any) {
                return {
                  spark: 'element',
                  content() {
                    return <Vector value={value} onChange={onChange} />;
                  },
                };
              },
            },
          ].filter(Boolean) as Spark[],
        })
      )}
      <Tooltip title="删除" placement="right">
        <Button type="primary" danger icon={<DeleteOutlined />} onClick={onDelete} />
      </Tooltip>
    </Space>
  );
}

function AddBtn({ onAddItem }: { onAddItem: (newItem: IType) => void }) {
  const [defaultValue, setDefaultValue] = useState<IType>({ type: 'string', key: '', value: '' });
  const { type, value } = defaultValue;
  let content: Spark;
  switch (type) {
    case 'string':
    case 'number': {
      content = {
        spark: 'element',
        content(render) {
          return render({
            spark: type,
            label: '值',
            value: value as any,
            onChange(newValue: any) {
              setDefaultValue({ ...defaultValue, type, value: newValue });
            },
          });
        },
      };
      break;
    }
    case 'boolean': {
      content = {
        spark: 'label',
        label: '值',
        content: {
          spark: 'element',
          content(render) {
            return render({
              spark: type,
              value: value as any,
              onChange(newValue: any) {
                setDefaultValue({ ...defaultValue, type, value: newValue });
              },
            });
          },
        },
      };
      break;
    }

    case 'Vector3':
    case 'Vector4': {
      content = {
        spark: 'element',
        content: () => (
          <Vector
            value={value}
            onChange={newValue => setDefaultValue({ ...defaultValue, type: type as any, value: newValue as any })}
          />
        ),
      };
    }
  }
  return (
    <>
      <Divider plain>新增变量</Divider>
      {render(
        withContext(defaultValue, setDefaultValue, {
          spark: 'grid',
          content: [
            {
              spark: 'element',
              content(render) {
                return render({
                  spark: 'select',
                  label: '变量类型',
                  options: [
                    { label: '文本', value: 'string' },
                    { label: '数值', value: 'number' },
                    { label: '开关', value: 'boolean' },
                    { label: '三维向量', value: 'Vector3' },
                    { label: '四维向量', value: 'Vector4' },
                  ],
                  value: defaultValue.type,
                  onChange(t) {
                    const type = t as IType['type'];
                    switch (type) {
                      case 'string': {
                        setDefaultValue({ ...defaultValue, type, value: '' });
                        return;
                      }
                      case 'number': {
                        setDefaultValue({ ...defaultValue, type, value: 0 });
                        return;
                      }
                      case 'boolean': {
                        setDefaultValue({ ...defaultValue, type, value: true });
                        return;
                      }
                      case 'Vector3': {
                        setDefaultValue({ ...defaultValue, type, value: [0, 0, 0] });
                        return;
                      }
                      case 'Vector4': {
                        setDefaultValue({ ...defaultValue, type, value: [0, 0, 0, 0] });
                        return;
                      }
                      default: {
                        neverThrow(type);
                      }
                    }
                  },
                });
              },
            },
            {
              spark: 'string',
              index: 'key',
              label: '变量名',
            },
            content,
          ],
        })
      )}
      <Button
        type="primary"
        block
        className={css({ margin: '20px 0' })}
        onClick={() => {
          try {
            onAddItem(defaultValue);
            setDefaultValue({ ...defaultValue, value: getDefaultValue(defaultValue.type) as any });
          } catch ({ message: m }) {
            message.warning(m);
          }
        }}
      >
        创建
      </Button>
    </>
  );
}

function getDefaultValue<T extends IType['type']>(type: T): IType['value'] {
  switch (type) {
    case 'boolean': {
      return true;
    }
    case 'string': {
      return '';
    }
    case 'number': {
      return 0;
    }
    case 'Vector3': {
      return [0, 0, 0];
    }
    case 'Vector4': {
      return [0, 0, 0, 0];
    }
    default: {
      return neverThrow(type);
    }
  }
}
