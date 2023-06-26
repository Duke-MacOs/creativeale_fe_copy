import { usePageParams } from '@main/routes/withPath';
import { css } from 'emotion';
import { ReactNode } from 'react';
import { Filter as FilterIcon } from '@icon-park/react';
import { ClearOutlined } from '@ant-design/icons';
import { Space, Typography, Button, Tag } from 'antd';
import render, { getIndexer, Spark } from '@editor/Editor/Property/cells';
import { pick } from 'lodash';

export default ({ children, filter }: { children: ReactNode; filter: Spark }) => {
  const { defaultParams, params, onParamsChange } = usePageParams();
  const extraFilter = pick(
    params,
    Object.entries(defaultParams)
      .filter(([key, value]) => value !== params[key] && keyLabel(key))
      .map(([key]) => key)
  );
  return (
    <div style={{ flex: 'auto', width: 0, minWidth: 1275 }}>
      <div
        className={css({
          marginBottom: 8,
          borderRadius: 4,
          padding: 24,
        })}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          {filter &&
            render({
              spark: 'context',
              provide() {
                return {
                  useValue(index) {
                    const { indexValue, indexEntries } = getIndexer(index);

                    return {
                      value: [indexValue(params)],
                      onChange([newValue]) {
                        onParamsChange(Object.fromEntries(indexEntries(newValue)));
                      },
                    };
                  },
                };
              },
              content: filter,
            })}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginLeft: 10,
          }}
        >
          <div style={{ display: 'flex', columnGap: 12, alignItems: 'center' }}>
            <Typography.Link>
              <FilterIcon theme="outline" style={{ lineHeight: 0, fontSize: 14 }} />
            </Typography.Link>
            <Space>
              {Object.entries(extraFilter).map(([key, value]) => {
                return (
                  value && (
                    <Tag
                      key={key}
                      closable
                      color="processing"
                      onClose={() => {
                        onParamsChange({ [key]: undefined });
                      }}
                    >
                      {keyLabel(key)}：{value}
                    </Tag>
                  )
                );
              })}
            </Space>
          </div>
          <Space size={30}>
            <Button
              type="link"
              icon={<ClearOutlined />}
              onClick={() => {
                onParamsChange((params, defaultParams) => ({ ...defaultParams, tab: params.tab }));
              }}
            >
              重置筛选
            </Button>
          </Space>
        </div>
      </div>
      <div style={{ borderRadius: 4 }}>{children}</div>
    </div>
  );
};

function keyLabel(key: string) {
  switch (key) {
    case 'tab':
      return '';
    case 'deleted':
      return '';
    case 'type':
      if (location.pathname.includes('/super/team')) {
        return '';
      }
      return '类型';
    case 'status':
      if (location.pathname.includes('/playable')) {
        return '';
      }
      return '状态';
    case 'id':
      return '项目ID';
    case 'userId':
      return '用户ID';
    case 'teamId':
      return '团队ID';
    case 'parentId':
      return '版本组ID';
    case 'templateId':
      return '模板ID';
    case 'industry':
      return '行业';
    default:
      return key;
  }
}
