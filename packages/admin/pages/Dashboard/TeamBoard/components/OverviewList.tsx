import { Button, Descriptions, Empty, Table, Tooltip } from 'antd';
import { IOnlineData } from '../type';
import { ViewList } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { useCurrentParams } from '..';
import { ISearchParams } from './Filter';
import { translateDateToDay } from '../utils';
interface OverviewListProps {
  data: IOnlineData[] | undefined;
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  params: ISearchParams | undefined;
  fetchOverviewList: (params: any) => Promise<void>;
}
export const OverviewList = ({ data, setCurrentPage, params, fetchOverviewList }: OverviewListProps) => {
  const setOldParams = useCurrentParams((state: any) => state.setOldParams);
  const columns = [
    {
      title: '项目',
      dataIndex: 'project_name_fixed_id',
      key: 'project_name_fixed_id',
      render: (project_name_fixed_id: string, record: IOnlineData) => (
        <Descriptions
          title={
            <Tooltip title={project_name_fixed_id ? project_name_fixed_id : '-'}>
              {project_name_fixed_id ? project_name_fixed_id : '-'}
            </Tooltip>
          }
          column={1}
        >
          <Descriptions.Item label="ID" style={{ padding: 0, userSelect: 'text' }}>
            {record.id}
          </Descriptions.Item>
          <Descriptions.Item style={{ padding: 0 }}>
            <Button
              type="link"
              icon={<Icon component={ViewList as any} />}
              style={{ padding: 0, fontSize: 12 }}
              onClick={() => {
                setOldParams({ ...params, id: record.id });
                setCurrentPage('case');
              }}
            >
              查看详情
            </Button>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      title: '消耗',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: string | number) => <div>{cost ? cost : '-'}</div>,
    },
    {
      title: '平均转化成本',
      dataIndex: 'cpa',
      key: 'cpa',
      render: (cpa: string | number) => <div>{cpa ? cpa : '-'}</div>,
    },
    {
      title: '展示数',
      dataIndex: 'show_cnt',
      key: 'show_cnt',
      render: (show_cnt: string | number) => <div>{show_cnt ? show_cnt : '-'}</div>,
    },
    {
      title: '点击数',
      dataIndex: 'click_cnt',
      key: 'click_cnt',
      render: (click_cnt: string | number) => <div>{click_cnt ? click_cnt : '-'}</div>,
    },
    {
      title: '转化数',
      dataIndex: 'convert_cnt',
      key: 'convert_cnt',
      render: (convert_cnt: string | number) => <div>{convert_cnt ? convert_cnt : '-'}</div>,
    },
    {
      title: 'atr',
      dataIndex: 'atr',
      key: 'atr',
      render: (atr: string | number) => <div>{atr ? atr : '-'}</div>,
    },
    {
      title: 'pvr',
      dataIndex: 'pvr',
      key: 'pvr',
      render: (pvr: string | number) => <div>{pvr ? pvr : '-'}</div>,
    },
    /* {
      title: 'send数',
      dataIndex: 'send_cnt',
      key: 'send_cnt',
      render: (send_cnt: string | number) => <div>{send_cnt ? send_cnt : '-'}</div>,
    }, */
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,100%)', justifyContent: 'space-between' }}>
      {data ? (
        <Table
          dataSource={data}
          columns={columns}
          scroll={{ y: 400 }}
          pagination={{
            total: data[0]?.total ?? (0 as any),
            showTotal: () => `共 ${data[0]?.total ?? 0} 项`,
            defaultPageSize: 10,
            defaultCurrent: 1,
            onChange: (page: number, pageSize: number) => {
              fetchOverviewList({ ...translateDateToDay(params!), page, pageSize });
            },
          }}
        />
      ) : (
        <Empty />
      )}
    </div>
  );
};
