import { Button, Empty, Table, Tooltip } from 'antd';
import { useState } from 'react';
import { IOnlineData } from '../type';
import { translateDateToDay } from '../utils';
import { ISearchParams } from './Filter';
import StateContainer from './StateContainer';
import { AuthorizeModal } from './AuthorizeModal';
import { oneService } from '@shared/api/oneServiceAPI';
import { CancelAuthorizeModal } from './CancelAuthorizeModal';
interface VersionListProps {
  data: IOnlineData[] | undefined;
  params: ISearchParams | undefined;
  fetchVersionList: (params: any) => Promise<void>;
  currentPlayableData: {
    playableUrl: string;
    auditH5: string;
    direct_playable_type: number;
  };
  setCurrentPlayableData: React.Dispatch<
    React.SetStateAction<{
      playableUrl: string;
      auditH5: string;
      direct_playable_type: number;
    }>
  >;
  currentPage?: string;
  setExitFetchs: React.Dispatch<React.SetStateAction<number[]>>;
}
enum Type {
  '互动H5' = 1,
  '互动Lynx' = 2,
  '互动视频Lynx' = 3,
  '互动视频H5' = 4,
  '直出互动h5+轻任务' = 5,
}
export const VersionList = StateContainer(
  ({
    data,
    params,
    fetchVersionList,
    setCurrentPlayableData,
    currentPlayableData,
    currentPage,
    setExitFetchs,
  }: VersionListProps) => {
    const showOperation = location.pathname.startsWith('/admin') && currentPage !== 'auth';
    const [authorizeUrl, setAuthorizeUrl] = useState<string>('');
    const [cancelUrl, setCancelUrl] = useState<string>('');
    const getAuthorizeUrl = async (playable_url: string) => {
      const { data } = await oneService.fetchAuthorizeUrl({ playable_url });
      setAuthorizeUrl(data.url);
    };
    const columns = [
      {
        title: '素材名称',
        dataIndex: 'project_name_fixed_id',
        key: 'project_name_fixed_id',
        render: (project_name_fixed_id: string, record: IOnlineData) => (
          <div>
            <Tooltip title={record.playable_url}>{project_name_fixed_id}</Tooltip>
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'direct_playable_type',
        key: 'direct_playable_type',
        render: (direct_playable_type: number) => <div>{Type[direct_playable_type]}</div>,
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
      {
        title: '加载完成率',
        dataIndex: 'load_complete_rate',
        key: 'load_complete_rate',
        render: (load_complete_rate: number) => <div>{load_complete_rate ? `${load_complete_rate}%` : '-'}</div>,
      },
      {
        title: '开始互动率',
        dataIndex: 'start_playable_rate',
        key: 'start_playable_rate',
        render: (start_playable_rate: number) => <div>{start_playable_rate ? `${start_playable_rate}%` : '-'}</div>,
      },
      {
        title: '互动完成率',
        dataIndex: 'complete_playable_rate',
        key: 'complete_playable_rate',
        render: (complete_playable_rate: number) => (
          <div>{complete_playable_rate ? `${complete_playable_rate}%` : '-'}</div>
        ),
      },
      {
        title: '包体大小',
        dataIndex: 'size',
        key: 'size',
        render: (size: number, record: IOnlineData) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>{size ? `${(size / 1024 / 1024).toFixed(2)}M` : '-'}</div>
            <div style={{ color: '#999999' }}>文件个数:{record.files_count ? record.files_count : '-'}</div>
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'playable_url',
        key: 'operation',
        render: (playable_url: string) => (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Button type="link" onClick={() => getAuthorizeUrl(playable_url)}>
              看数授权
            </Button>
            <Button type="link" onClick={() => setCancelUrl(playable_url)}>
              取消授权
            </Button>
          </div>
        ),
      },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1,100%)', justifyContent: 'space-between' }}>
        {data ? (
          <Table
            dataSource={data}
            columns={showOperation ? columns : columns.filter(item => item.key !== 'operation')}
            rowKey="playable_url"
            scroll={{ y: 200 }}
            rowSelection={{
              type: 'radio',
              selectedRowKeys: [currentPlayableData?.playableUrl],
              onChange: (selectedRowKeys: React.Key[], selectedRows: IOnlineData[]) => {
                const playableUrl = selectedRowKeys[0] as string;
                const auditH5 = selectedRows[0].audit_h5?.replace(/\"/g, '') as string;
                const direct_playable_type = selectedRows[0].direct_playable_type as number;
                setCurrentPlayableData({ playableUrl, auditH5, direct_playable_type });
                setExitFetchs([]);
              },
            }}
            pagination={{
              total: data[0]?.total ?? 0,
              showTotal: () => `共 ${data[0]?.total ?? 0} 项`,
              defaultPageSize: 10,
              defaultCurrent: 1,
              onChange: (page: number, pageSize: number) => {
                fetchVersionList({ ...translateDateToDay(params!), page, pageSize });
              },
            }}
          />
        ) : (
          <Empty />
        )}

        {authorizeUrl && <AuthorizeModal data={authorizeUrl} onClose={() => setAuthorizeUrl('')} />}
        {cancelUrl && <CancelAuthorizeModal playable_url={cancelUrl} onClose={() => setCancelUrl('')} />}
      </div>
    );
  },
  'versionList'
);
