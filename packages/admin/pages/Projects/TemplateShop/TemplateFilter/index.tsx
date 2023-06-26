import { INDUSTRY_OPTIONS } from '@main/pages/Projects/ProjectList/columns/ProjectModal';
import { IMyProjectParams } from '@main/pages/Projects/ProjectList/api';
import { usePageParams } from '@main/routes/withPath';
import { Input, Select, Layout } from 'antd';
import { memo, useState } from 'react';

const { Header } = Layout;
const { Search } = Input;

export default memo(() => {
  const {
    params: { keyword, industry },
    onParamsChange,
  } = usePageParams<IMyProjectParams>();
  const [paramKeyword, setParamKeyword] = useState(keyword);
  return (
    <Header
      style={{
        width: '100%',
        background: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        padding: '32px 0',
        alignItems: 'start',
        height: 'auto',
      }}
    >
      <Search
        allowClear
        size="large"
        enterButton="搜索"
        placeholder="请输入模板名称"
        style={{ width: '38%' }}
        value={paramKeyword}
        addonBefore={
          <Select
            bordered={false}
            defaultValue={industry}
            onChange={industry => {
              onParamsChange({ industry });
            }}
          >
            <Select.Option value="">全部</Select.Option>
            {INDUSTRY_OPTIONS.map(({ label, value }) => {
              return (
                <Select.Option key={String(value)} value={String(1 << value)}>
                  {label}
                </Select.Option>
              );
            })}
          </Select>
        }
        onChange={({ target: { value } }) => {
          setParamKeyword(value);
        }}
        onSearch={keyword => {
          onParamsChange({ keyword });
        }}
      />
    </Header>
  );
});
