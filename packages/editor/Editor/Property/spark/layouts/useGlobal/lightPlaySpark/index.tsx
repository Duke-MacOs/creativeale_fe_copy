import { getIndexer, Spark, updateIndices } from '@editor/Editor/Property/cells';
import { CodeOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import schemaValue from './schemaValue';
import { Button, message, Space, Switch, Tooltip, Upload } from 'antd';
import useSchema from './useSchema';
import pageSpark from './pageSpark';
import { get, has, set } from 'lodash';
import toSpark from './toSpark';
import { useState } from 'react';
import { downloadBlob } from '@editor/utils';
import { JsonEditor } from '@editor/common/JsonEditor';
import { css } from 'emotion';

export const lightPlaySpark = (): Spark => {
  return {
    spark: 'value',
    index: 'LightPlay',
    visit: true,
    content(value = schemaValue(), onChange) {
      const { schema, openKeys, hidden } = useSchema(value._editor);
      const setSchema = (schema: any, options?: any) => {
        const newValues = schemaValue(schema, value);
        onChange(
          set(
            newValues,
            '_editor.openKeys',
            (openKeys as string[]).filter(path => has(newValues, path))
          ),
          options
        );
      };
      const [showAll, setShowAll] = useState(true);
      const [jsonMode, setJsonMode] = useState(false);

      return {
        spark: 'context',
        provide({ openKeys: { checking, enabled } }) {
          return {
            openKeys: {
              enabled,
              checking,
              openKeys,
              setOpenKeys(checked, slice) {
                onChange(set({ ...value }, '_editor.openKeys', updateIndices(openKeys, checked, slice)));
              },
            },
            useValue(index) {
              const { indexValue, indexEntries } = getIndexer(index, get);
              if (!index) {
                return {
                  value: [value],
                  onChange([newValue], options) {
                    onChange(newValue, options);
                  },
                };
              }
              return {
                value: [indexValue(value)],
                onChange([partial], options) {
                  onChange(
                    indexEntries(partial).reduce((o, [key, value]) => set(o, key, value), { ...value }),
                    options
                  );
                },
              };
            },
          };
        },
        content: {
          spark: 'visit',
          index: 'light_play',
          label: '轻互动设置',
          content: jsonMode
            ? {
                spark: 'value',
                index: '',
                content(value, onChange) {
                  return {
                    spark: 'element',
                    content() {
                      return (
                        <JsonEditor
                          value={JSON.stringify(value, null, 4)}
                          onChange={json => {
                            try {
                              if (json) {
                                const value = JSON.parse(json);
                                onChange(value);
                              }
                            } catch (error) {}
                          }}
                        />
                      );
                    },
                  };
                },
              }
            : {
                spark: 'grid',
                content: Array.from(toSpark(schema, setSchema, hidden, showAll)),
              },
          extra: {
            spark: 'visit',
            hidden,
            index: 'play_page',
            label: '编辑分页信息',
            content: pageSpark(schema[0], (schema, options) => setSchema([schema], options)),
            extra: {
              spark: 'element',
              content() {
                return (
                  <Space>
                    <Tooltip title="导出配置">
                      <Button
                        size="small"
                        type="text"
                        icon={<UploadOutlined />}
                        onClick={() => {
                          downloadBlob(new Blob([JSON.stringify(schema)]), 'config.json');
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="导入配置">
                      <Upload
                        accept="json"
                        showUploadList={false}
                        beforeUpload={async file => {
                          try {
                            const json = await file.text();
                            const schema = JSON.parse(json);
                            setSchema(schema);
                          } catch (err) {
                            message.error(err);
                          }
                          return false;
                        }}
                      >
                        <Button size="small" type="text" icon={<DownloadOutlined />} />
                      </Upload>
                    </Tooltip>
                  </Space>
                );
              },
            },
            fallback(onVisit) {
              return {
                spark: 'element',
                content: () => (
                  <Space>
                    <Tooltip title={showAll ? '只展示自定配置' : '展示所有'}>
                      <Switch
                        size="small"
                        checked={showAll}
                        onChange={val => {
                          setShowAll(val);
                        }}
                      />
                    </Tooltip>

                    <Tooltip title="JSON编辑">
                      <CodeOutlined
                        className={css({
                          cursor: 'pointer',
                        })}
                        onClick={() => {
                          setJsonMode(mode => !mode);
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="编辑分页信息">
                      <Button size="small" type="text" icon={<EditOutlined />} onClick={onVisit} />
                    </Tooltip>
                  </Space>
                ),
              };
            },
          },
          fallback(onVisit) {
            return {
              spark: 'group',
              content: {
                spark: 'element',
                content: () => (
                  <Button type="primary" onClick={onVisit} style={{ width: '100%' }}>
                    轻互动设置
                  </Button>
                ),
              },
            };
          },
        },
      };
    },
  };
};
