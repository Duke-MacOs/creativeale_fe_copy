import { Layout, Spin, Tabs } from 'antd';
import type { Tab } from 'antd';
import TemplateList from './TemplateList';
import TemplateFilter from './TemplateFilter';
import { withLoading } from '@main/table';
import { FieldTimeOutlined, FireOutlined } from '@ant-design/icons';
import { IMyProjectParams } from '../ProjectList/api';
import { usePageParams } from '@main/routes/withPath';
import { css } from 'emotion';
import { useHasFeature } from '@shared/userInfo';

const { Content } = Layout;

export default withLoading(({ loading: { spinning, tip } }) => {
  const {
    params: { typeOfPlay },
    onParamsChange,
  } = usePageParams<IMyProjectParams>();
  const hasFeature = useHasFeature('<direct_play>');
  return (
    <Spin spinning={spinning} tip={tip} wrapperClassName={css({ width: '100%' })}>
      <Layout>
        <TemplateFilter />
        <Tabs
          style={{ margin: '0 auto', width: '1440px' }}
          activeKey={typeOfPlay}
          onChange={typeOfPlay => {
            onParamsChange({ typeOfPlay });
          }}
          items={
            [
              {
                label: (
                  <span>
                    <FieldTimeOutlined />
                    互动落地页
                  </span>
                ),
                key: '0',
              },
              hasFeature && {
                label: (
                  <span>
                    <FireOutlined />
                    直出互动
                  </span>
                ),
                key: '3',
              },
            ].filter(Boolean) as Tab[]
          }
        />
        <Content style={{ width: '100%' }}>
          <TemplateList />
        </Content>
      </Layout>
    </Spin>
  );
});
