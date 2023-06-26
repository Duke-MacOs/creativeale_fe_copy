import PageContainer from '@main/views/PageContainer';
import { IPageParams, usePageParams } from '../../../routes/withPath';
import Table, { TEAM_TABS } from './TeamTable';
import { FeaturesMap } from '@shared/userInfo';
import { matcher } from '../../Projects/ProjectList/matcher';

export interface ITeamParams extends IPageParams {
  keyword: string;
  feature: string;
  teamId: string;
  type: string;
  match: number;
  userId?: string;
}

export default function Teams() {
  const { params } = usePageParams<ITeamParams>();
  return (
    <PageContainer
      filter={{
        spark: 'flex',
        columnGap: 40,
        content: [
          {
            spark: 'label',
            label: '团队名称',
            width: 88,
            content: {
              spark: 'string',
              index: 'keyword',
              allowClear: true,
            },
          },
          {
            spark: 'label',
            label: '团队ID',
            width: 88,
            content: {
              spark: 'string',
              index: 'teamId',
              allowClear: true,
            },
          },
          matcher(({ MenuAdmin }) => MenuAdmin)(params.match)
            ? {
                spark: 'label',
                label: '团队类型',
                width: 88,
                content: {
                  spark: 'select',
                  index: 'type',
                  options: [{ name: '全部', value: '' }, ...TEAM_TABS.slice(1)].map(({ name, value }) => ({
                    label: name,
                    value,
                  })),
                },
              }
            : {
                spark: 'label',
                label: '创建者ID',
                width: 88,
                content: {
                  spark: 'string',
                  index: 'userId',
                  allowClear: true,
                },
              },
          {
            spark: 'label',
            label: '实验功能',
            width: 88,
            content: {
              spark: 'select',
              index: 'feature',
              options: [
                { label: '全部', value: '' },
                ...Object.entries(FeaturesMap).map(([value, label]) => ({ value, label })),
              ],
            },
          },
        ],
      }}
      children={<Table />}
    />
  );
}
