import { DotChartOutlined, HeatMapOutlined, PieChartOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import React from 'react';
import Dashboard from './Dashboard';
import Slardar from './Slardar';
import SlardarCase from './SlardarCase';
import Tea from './Tea';

export default () => {
  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <Tabs
        defaultActiveKey="1"
        animated={true}
        size="large"
        style={{ width: '100%' }}
        items={[
          {
            label: (
              <span style={{ marginLeft: '10px' }}>
                <HeatMapOutlined />
                仪表盘
              </span>
            ),
            children: <Dashboard />,
            key: '1',
          },
          {
            label: (
              <span>
                <PieChartOutlined />
                Tea
              </span>
            ),
            children: <Tea />,
            key: '2',
          },
          {
            label: (
              <span>
                <DotChartOutlined />
                Slardar(编辑器)
              </span>
            ),
            children: <Slardar />,
            key: '3',
          },
          {
            label: (
              <span>
                <DotChartOutlined />
                Slardar(case)
              </span>
            ),
            children: <SlardarCase />,
            key: '4',
          },
        ]}
      />
    </div>
  );
};
