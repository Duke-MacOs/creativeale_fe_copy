import { Space } from '.';
import { LineChart } from '../charts/Line';
import { ITrendData } from '../type';
import { Empty } from 'antd';
import StateContainer from './StateContainer';

export const CasesTrend = StateContainer(({ data }: { data: ITrendData | undefined }) => {
  const barData = {
    series: [
      {
        name: '消耗',
        type: 'line',
        data: data?.cost,
        symbol: 'circle',
      },
      {
        name: '展示数',
        type: 'line',
        data: data?.show_cnt,
        symbol: 'circle',
      },
      {
        name: '转化数',
        type: 'line',
        data: data?.convert_cnt,
        symbol: 'triangle',
      },
      {
        name: 'cpa',
        type: 'line',
        data: data?.cpa,
        symbol: 'rect',
      },
      {
        name: 'pvr',
        type: 'line',
        data: data?.pvr,
        symbol: 'circle',
      },
    ],
    category: data?.date,
  } as any;
  return (
    <Space
      size={100}
      style={{
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        gridTemplateColumns: '70% 30%',
      }}
    >
      {data && data?.date?.length ? (
        <div>
          <LineChart {...barData} />
        </div>
      ) : (
        <Empty />
      )}
      <img
        style={{ width: '50%', justifySelf: 'center' }}
        src="https://p6-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/938a1b591bc8494aa40cc9c03af07d50.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1969168111&x-signature=dNNb5zqPVKxfUelH4MQBnKSiiSg%3D"
      />
    </Space>
  );
}, 'caseTrend');
