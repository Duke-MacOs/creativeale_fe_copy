import PageContainer from '@main/views/PageContainer';
import { message } from 'antd';
import { useEffect } from 'react';
import { IPageParams } from '../../routes/withPath';
import Table from './Table';

export interface IPutParams extends IPageParams {
  page: number;
  pageSize: number;
  projectId: string;
  projectUserId: string;
  exportType: string;
  userId: string;
  teamId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function MyPut() {
  useEffect(() => {
    if (
      decodeURIComponent(location.search).includes('redirectResponse=') &&
      JSON.parse(decodeURIComponent(location.search).split('redirectResponse=')[1] || '').message ===
        '素材移交失败：该移交链接未找到或已过期'
    ) {
      message.warning('素材移交失败：该移交链接未找到或已过期');
    }
  }, []);
  return (
    <PageContainer
      filter={{
        spark: 'grid',
        content: [
          {
            spark: 'label',
            label: '项目ID',
            width: 88,
            cols: 2,
            content: {
              spark: 'string',
              index: 'projectId',
              allowClear: true,
            },
          },

          {
            spark: 'dateRange',
            index: ['startDate', 'endDate'],
            label: '创建时间',
            cols: 2,
            width: 88,
          },
          {
            spark: 'label',
            label: '导出类型',
            width: 88,
            cols: 2,
            content: {
              spark: 'select',
              index: 'exportType',
              options: [
                // 类型枚举值查询服务端enum PlayableSource
                { label: '全部', value: '' },
                { label: '直出h5', value: '10' },
                { label: '直出lynx', value: '8' },
                { label: '直出lynx互动视频', value: '9' },
                { label: '直出h5互动视频', value: '11' },
              ],
            },
          },
          {
            spark: 'label',
            label: '用户ID',
            width: 88,
            cols: 2,
            hidden: location.pathname.startsWith('/my'),
            content: {
              spark: 'string',
              index: 'userId',
              allowClear: true,
            },
          },
          {
            spark: 'label',
            label: '团队ID',
            width: 88,
            cols: 2,
            hidden: !location.pathname.startsWith('/super'),
            content: {
              spark: 'string',
              index: 'teamId',
              allowClear: true,
            },
          },
        ],
      }}
      children={<Table />}
    />
  );
}
