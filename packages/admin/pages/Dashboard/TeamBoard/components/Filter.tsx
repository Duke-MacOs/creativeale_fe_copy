import { Badge, Button, Col, DatePicker, Input, Row, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { Moment } from 'moment';
import { Space } from '.';
import { Platform } from '@shared/types/project';
import { useCurrentParams } from '..';
import moment from 'moment';
type RangeValue = [Moment | null, Moment | null] | null;

export interface ISearchParams {
  id?: number | undefined;
  platform?: Platform | undefined;
  date?: RangeValue;
  playable_url?: string;
  userId?: number;
  teamId?: number;
  role?: string;
  ids?: number[] | undefined;
  adv_id?: number;
}
export interface IFilter {
  currentPage?: string;
  onSearch: (params: ISearchParams) => void;
}

const PlatformItems = [
  {
    value: undefined,
    label: '全部',
  },
  ...Object.entries(Platform)
    .filter(([, value]) => typeof value === 'number')
    .map(([label, value]) => {
      return {
        value,
        label,
      };
    }),
];

export const Filter = ({ currentPage, onSearch }: IFilter) => {
  const oldParams = useCurrentParams((state: any) => state.oldParams);
  const [search, setSearch] = useState<ISearchParams>({
    id: undefined,
    platform: undefined,
    date: [moment().startOf('day').subtract(7, 'd'), moment().startOf('day').subtract(1, 'd')],
  });
  const [dates, setDates] = useState<RangeValue>(null);
  const [hackValue, setHackValue] = useState<RangeValue>([
    moment().startOf('day').subtract(7, 'd'),
    moment().startOf('day').subtract(1, 'd'),
  ]);

  const disabledDate = (current: Moment) => {
    if (!dates) {
      return false;
    }

    // 只能查询最近一个月内的数据
    const tooLate = current && current.diff(moment(), 'days') >= 0;
    const tooEarly = current && moment().diff(current, 'days') > 30;
    return !!tooEarly || !!tooLate;
  };
  const onOpenChange = (open: boolean) => {
    if (open) {
      setHackValue([null, null]);
      setDates([null, null]);
    } else {
      setHackValue(null);
    }
  };
  const onChangeSearch = <T extends keyof ISearchParams>(key: keyof ISearchParams, value: ISearchParams[T]) => {
    setSearch({
      ...search,
      [key]: value,
    });
  };
  useEffect(() => {
    if (oldParams.id && currentPage === 'case') {
      onSearch(oldParams);
      setSearch({ ...search, ...oldParams });
    }
  }, [oldParams]);
  return (
    <Space direction="horizontal" size={1} style={{ padding: '20px 0', alignItems: 'center', marginBottom: '20px' }}>
      <Space size={1} style={{ flexGrow: 1, gridTemplateRows: 'auto auto 1fr' }}>
        <Row
          gutter={[16, 16]}
          style={{
            // margin: 0,
            display: 'flex',
            alignItems: 'center',
            height: '100px',
            padding: '0 10px',
          }}
        >
          {currentPage !== 'auth' && (
            <Col className="gutter-row" span={8} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '90px', textAlign: 'end' }}>
                {currentPage === 'case' && <Badge count={<span style={{ color: '#f5222d' }}>*</span>} />}
                <span style={{ color: '#999999' }}>项目ID：</span>
              </div>
              <Input
                allowClear
                style={{ width: '300px' }}
                value={search.id}
                onChange={e => {
                  onChangeSearch('id', e.target.value ? Number(e.target.value) : undefined);
                }}
              />
            </Col>
          )}
          {/* {currentPage !== 'case' && (
            <Col className="gutter-row" span={8} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ color: '#999999', width: '90px', textAlign: 'end' }}>用户ID：</div>
              <Input.Search
                allowClear
                style={{ width: '300px' }}
                value={search.userId}
                onChange={e => {
                  onChangeSearch('userId', e.target.value ? Number(e.target.value) : undefined);
                }}
              />
            </Col>
          )} */}

          <Col className="gutter-row" span={8} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: '#999999', width: '90px', textAlign: 'end' }}>时间：</div>
            <DatePicker.RangePicker
              allowClear={false}
              value={search.date || hackValue}
              disabledDate={disabledDate}
              onCalendarChange={val => setDates(val)}
              onChange={val => {
                onChangeSearch('date', val);
              }}
              onOpenChange={onOpenChange}
              style={{ width: '300px' }}
            />
          </Col>

          <Col className="gutter-row" span={8} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: '#999999', width: '90px', textAlign: 'end' }}>平台：</div>
            <Select
              style={{ width: 300 }}
              allowClear
              value={search.platform}
              onChange={val => {
                onChangeSearch('platform', val);
              }}
            >
              {PlatformItems.map(({ value, label }: any) => (
                <Select.Option key={label} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Space>
      <div style={{ padding: '0 15px', marginRight: '20px' }}>
        <Button
          type="primary"
          onClick={() => {
            onSearch(search);
          }}
        >
          搜索
        </Button>
      </div>
    </Space>
  );
};
