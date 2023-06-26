import React, { useEffect, useRef, useState } from 'react';
import { usePersistCallback } from '@byted/hooks';
import { Empty, Form, Tooltip, Select, Tag, Spin } from 'antd';
import { css } from 'emotion';
import { http } from '@shared/api';

interface StepTwoProps {
  setSearching: any;
  searching: boolean;
  options: any[];
  loading: boolean;
  form: any;
}

export default function StepTwo({ form, searching, setSearching, loading, options }: StepTwoProps) {
  const [searchOptions, setSearchOptions] = useState([] as any[]);
  const [granted, setGranted] = useState([] as string[]);
  const [searchValue, setSearchValue] = useState('');
  const aadvidMap = useRef<Record<string, boolean>>({});
  const updateGranted = usePersistCallback((granted: string | string[]) => {
    if (Array.isArray(granted)) {
      setGranted(granted);
      form.setFieldsValue({ granted });
    } else {
      setGranted(list => {
        if (list.includes(granted)) {
          return list;
        }
        form.setFieldsValue({ granted: list.concat(granted) });
        return list.concat(granted);
      });
    }
  });
  useEffect(() => {
    const advIdMap = async (advId: string) => {
      if (!advId) {
        return advId;
      }
      if (aadvidMap.current[advId] === undefined) {
        try {
          const {
            data: { data },
          } = await http.get('user/advExist', { params: { advId } });
          aadvidMap.current[advId] = data.advId === advId;
        } catch {
          console.error('Failed to check advId', advId);
        }
      }
      return advId;
    };
    const advIdsThen = (advIds: string[]) => {
      setSearchValue(value => {
        for (const advId of advIds) {
          value = value.replace(new RegExp(`${advId}[ ,;，；]+`, 'g'), '');
          updateGranted(advId);
        }
        return value;
      });
    };
    const lastAdvIdThen = (id: string) => {
      if (!id || !aadvidMap.current[id]) {
        setSearchOptions([]);
      } else {
        setSearchOptions([{ id, name: '' }]);
      }
    };
    const advIds = searchValue.split(/[ ,;，；]+/);
    const lastAdvId = advIds.pop() ?? '';
    setSearching(true);
    Promise.all([
      Promise.all(
        advIds
          .filter(Boolean)
          .filter(advId => options.every(({ id }) => advId !== id))
          .map(advIdMap)
      ),
      advIdMap(lastAdvId),
    ])
      .then(([advIds, lastAdvId]) => {
        lastAdvIdThen(lastAdvId);
        advIdsThen(advIds);
      })
      .finally(() => {
        setSearching(false);
      });
  }, [searchValue, options, updateGranted, setSearching]);
  return (
    <Form form={form} layout="vertical" initialValues={{ granted }} style={{ minHeight: 200 }}>
      <Form.Item
        label={`广告主ID(${granted.length}/20)`}
        name="granted"
        rules={[
          {
            required: true,
            message: '至少选择一个广告主ID！',
          },
          {
            validator(_rule, value, callback) {
              if (value.length > 20) {
                callback('至多选择20个广告主ID！');
              } else {
                callback();
              }
            },
          },
        ]}
      >
        <Select
          allowClear
          disabled={loading}
          loading={loading}
          virtual={false}
          mode="multiple"
          className={css({
            width: '84% !important',
            '.ant-select-selection-overflow': {
              minHeight: 92,
              alignContent: 'flex-start',
            },
            '.ant-select-selection-placeholder': {
              top: 4,
              transform: 'none',
            },
          })}
          placeholder="请输入广告主ID，批量输入时以分隔符间隔，支持，；和空格，不区分中英文输入法"
          notFoundContent={<Empty description="没有找到相关广告主" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          searchValue={searchValue}
          onSearch={value => {
            for (const item of value.split(/[ ,;，；]+/).slice(0, -1)) {
              if (options.some(({ id }) => item === id)) {
                value = value.replace(new RegExp(`${item}[ ,;，；]+`, 'g'), '');
                updateGranted(item);
              }
            }
            setSearchValue(value);
          }}
          onChange={(granted: string[]) => {
            updateGranted(granted);
            setSearchValue('');
          }}
          filterOption={(input, { value }: any) => {
            return value.startsWith(input);
          }}
          tagRender={({ label, value, closable, onClose }) => {
            const authed = options.some(({ id }) => value === id);
            const existed = authed || aadvidMap.current[value as string];
            return (
              <Tooltip title={!existed ? '该ID不存在' : undefined}>
                <Tag color={existed ? 'default' : 'warning'} closable={closable} onClose={onClose}>
                  {authed ? label : aadvidMap.current[value as string] ? `${value}-` : value}
                </Tag>
              </Tooltip>
            );
          }}
          dropdownRender={menu =>
            searching ? (
              <div style={{ textAlign: 'center', padding: 8 }}>
                <Spin spinning />
              </div>
            ) : (
              <div>
                {options.some(({ id }) => id.startsWith(searchValue)) && !searchOptions.length && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px' }}>
                    <strong>当前可推送账户</strong>
                    <small>说明：以下为已绑定账户和已授权通过的账户</small>
                  </div>
                )}
                {menu}
              </div>
            )
          }
        >
          {options.concat(searchOptions).map(({ id, name }) => (
            <Select.Option key={id} value={id} disabled={granted.length >= 20 && !granted.includes(id)}>
              {id}-{name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Form>
  );
}
