import { Pagination } from 'antd';
import TemplateItem from './TemplateItem';
import { useProjectQuery } from '../ProjectList/ProjectTable';
import { usePageParams } from '@main/routes/withPath';
import { IMyProjectParams } from '../ProjectList/api';
import { css } from 'emotion';
import style from './style';
import { EmptyHolder } from '@main/pages/views';

export default () => {
  const { total, projectList } = useProjectQuery();
  const {
    params: { page, pageSize },
    onParamsChange,
  } = usePageParams<IMyProjectParams>();

  return (
    <section className={style.list}>
      <div className={style.items}>
        {projectList.map((item, index) => (
          <TemplateItem key={item.id} data={item} index={index} />
        ))}
        {!projectList.length && <EmptyHolder message="暂无更多模板" />}
      </div>
      <div
        className={css({
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 0',
        })}
      >
        <Pagination
          pageSizeOptions={[18, 36, 54, 72, 90]}
          current={page}
          pageSize={pageSize}
          total={total}
          showTotal={total => <div>总共 {total} 个模板</div>}
          onChange={(page, pageSize) => {
            onParamsChange({ page, pageSize }, { resetPage: false });
          }}
        />
      </div>
    </section>
  );
};
