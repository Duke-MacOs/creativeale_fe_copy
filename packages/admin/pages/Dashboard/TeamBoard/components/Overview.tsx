import { Col, Empty } from 'antd';
import { css } from 'emotion';
import { IOnlineData } from '../type';

const style = {
  itemWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
  }),
  itemTitle: css({
    color: 'rgba(99, 104, 111)',
    marginBottom: '10px',
  }),
  itemNumber: css({
    fontWeight: 'bold',
    fontSize: '15px',
  }),
};
const itemName = [
  { key: 'cost', name: '消耗（元）' },
  { key: 'cpa', name: '平均转化成本（元）' },
  { key: 'show_cnt', name: '展示数' },
  { key: 'click_cnt', name: '点击数' },
  { key: 'convert_cnt', name: '转化数' },
  // { key: 'send_cnt', name: 'send数' },
];
export const Overview = ({ data }: { data: IOnlineData | undefined }) => {
  return (
    <div
      style={{
        display: 'flex',
        padding: '25px 10px 25px 30px',
        borderRadius: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {data ? (
        itemName.map((item: any) => (
          <Col className="gutter-row" span={4} key={item.key}>
            <div className={style.itemWrapper}>
              <div className={style.itemTitle}>{item.name}</div>
              <div className={style.itemNumber}>{(data as any)[item.key] || '-'}</div>
            </div>
          </Col>
        ))
      ) : (
        <Empty style={{ margin: '0 auto' }} />
      )}
    </div>
  );
};
