import { useState } from 'react';
import { EmptyWrapper, GraphTitle, Loading, Space } from '.';
import { PieChart } from '../charts/Pie';
import { IAgeOrGenderData } from '../type';
import { BarReverseChart } from '../charts/BarReverse';
import { Tabs } from 'antd';
import StateContainer from './StateContainer';

export const UserPortrait = StateContainer(
  ({
    genderData,
    ageData,
    areaData,
    fetchAreaData,
    params,
  }: {
    genderData: IAgeOrGenderData | undefined;
    ageData: IAgeOrGenderData | undefined;
    areaData: IAgeOrGenderData | undefined;
    fetchAreaData: (params: any, pageSize?: string) => Promise<void>;
    params: any;
  }) => {
    const [areaName, setAreaName] = useState<string>('province_name');
    const [areaChanging, setAreaChanging] = useState<boolean>(false);
    return (
      <Space
        size={0}
        style={{
          padding: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'space-around',
          gridTemplateColumns: 'repeat(3, auto)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {location.pathname.includes('super') ? (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>性别分析-send量</GraphTitle>
              {(genderData?.send_data ?? []).length > 0 ? (
                <PieChart data={genderData?.send_data} legendPosition="bottom" width="330px" />
              ) : (
                <EmptyWrapper />
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>性别分析-展示量</GraphTitle>
              {(genderData?.show_data ?? []).length > 0 ? (
                <PieChart data={genderData?.show_data} legendPosition="bottom" width="330px" />
              ) : (
                <EmptyWrapper />
              )}
            </div>
          )}
          <div>
            <GraphTitle>性别分析-转化量</GraphTitle>
            {(genderData?.convert_data ?? []).length > 0 ? (
              <PieChart data={genderData?.convert_data} legendPosition="bottom" width="330px" />
            ) : (
              <EmptyWrapper />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {location.pathname.includes('super') ? (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>年龄分析-send量</GraphTitle>
              {(ageData?.send_data ?? []).length > 0 ? <BarReverseChart data={ageData?.send_data} /> : <EmptyWrapper />}
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>年龄分析-展示量</GraphTitle>
              {(ageData?.show_data ?? []).length > 0 ? <BarReverseChart data={ageData?.show_data} /> : <EmptyWrapper />}
            </div>
          )}
          <div>
            <GraphTitle>年龄分析-转化量</GraphTitle>
            {(ageData?.convert_data ?? []).length > 0 ? (
              <BarReverseChart data={ageData?.convert_data} />
            ) : (
              <EmptyWrapper />
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {((areaData?.show_data ?? []).length > 0 || (areaData?.convert_data ?? []).length > 0) && (
            <Tabs
              defaultActiveKey={areaName}
              style={{ position: 'absolute', right: 0, top: '-13px', zIndex: 1 }}
              onChange={async (name: string) => {
                setAreaChanging(true);
                setAreaName(name);
                await fetchAreaData(params, name);
                setAreaChanging(false);
              }}
              items={[
                { label: '按省', key: 'province_name' },
                { label: '按市', key: 'city_name' },
              ].map(item => ({
                label: (
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#666666',
                      fontWeight: 300,
                      fontFamily: 'Noto Sans',
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </span>
                ),
                key: item.key,
              }))}
            />
          )}
          {/* <BarReverseChart data={areaData?.send_data || []} title="区域分析-send量(TOP 10)" /> */}
          {location.pathname.includes('super') ? (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>区域分析-send量(TOP 10)</GraphTitle>
              {areaChanging ? (
                <Loading height="330px" width="510px" />
              ) : areaData?.send_data?.length ? (
                <BarReverseChart data={areaData?.send_data} />
              ) : (
                <EmptyWrapper />
              )}
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <GraphTitle>区域分析-展示量(TOP 10)</GraphTitle>
              {areaChanging ? (
                <Loading height="330px" width="510px" />
              ) : areaData?.show_data?.length ? (
                <BarReverseChart data={areaData?.show_data} />
              ) : (
                <EmptyWrapper />
              )}
            </div>
          )}
          <div>
            <GraphTitle>区域分析-转化量(TOP 10)</GraphTitle>
            {areaChanging ? (
              <Loading height="330px" width="510px" />
            ) : areaData?.convert_data?.length ? (
              <BarReverseChart data={areaData?.convert_data} />
            ) : (
              <EmptyWrapper />
            )}
          </div>
        </div>
      </Space>
    );
  },
  'userPortrait',
  { height: '330px', width: '100%' }
);
