import PageContainer from '@main/views/PageContainer';
import ProjectTable from './ProjectTable';
import { useHasFeature } from '@shared/userInfo';

export default function Projects() {
  const allFeature = useHasFeature();
  const directPlayFeature = useHasFeature('<direct_play>');
  return (
    <PageContainer
      filter={{
        spark: 'grid',
        columnGap: 40,
        content: [
          {
            spark: 'flex',
            columnGap: 40,
            content: [
              {
                spark: 'radioGroup',
                index: 'typeOfPlay',
                label: '项目类型',
                width: 88,
                options: [
                  { label: '全部', value: '' },
                  { label: '普通互动', value: '0' },
                  allFeature && { label: '轻互动', value: '2' },
                  directPlayFeature && { label: '直出互动', value: '3' },
                  allFeature && { label: '互动视频', value: '4' },
                ].filter(Boolean) as any[],
              },
              {
                spark: 'label',
                label: '项目ID',
                width: 88,
                content: {
                  spark: 'string',
                  index: 'id',
                  allowClear: true,
                },
              },
              {
                spark: 'label',
                label: '模板ID',
                width: 88,
                content: {
                  spark: 'string',
                  index: 'templateId',
                  allowClear: true,
                },
              },
            ],
          },
          {
            spark: 'flex',
            columnGap: 40,
            content: [
              {
                spark: 'radioGroup',
                index: 'category',
                label: '互动形式',
                width: 88,

                options: [
                  { label: '全部', value: '' },
                  { label: '2D', value: '0' },
                  { label: '3D', value: '1' },
                  { label: 'VR', value: '2' },
                  { label: 'AR', value: '3' },
                ],
              },
              {
                spark: 'label',
                label: '项目名称',
                width: 88,
                content: {
                  spark: 'string',
                  index: 'keyword',
                  allowClear: true,
                },
              },
              {
                spark: 'dateRange',
                index: ['startDate', 'endDate'],
                label: '更新时间',
                width: 88,
              },
            ],
          },
        ],
      }}
    >
      <ProjectTable />
    </PageContainer>
  );
}
