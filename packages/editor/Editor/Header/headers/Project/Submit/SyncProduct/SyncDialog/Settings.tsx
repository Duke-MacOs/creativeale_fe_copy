import { Radio, Input, Form } from 'antd';
import { css } from 'emotion';

interface StepOneProps<T = any> {
  onValuesChange(values: T): void;
  initialValues: T;
  outdated: boolean;
  showZipName: boolean;
  nextAction?: string;
  loading?: boolean;
  zipSize?: number;
  size: number;
  form: any;
  isVRVideo?: boolean;
}
export const format = (size: number) => Math.max(size / 1024 / 1024, 0.1).toFixed(1);

export default function Settings({
  form,
  size,
  outdated,
  showZipName,
  initialValues,
  zipSize,
  loading,
  nextAction = '下一步',
  onValuesChange,
  isVRVideo,
}: StepOneProps) {
  return (
    <Form
      form={form}
      colon={false}
      initialValues={initialValues}
      wrapperCol={{ span: 19 }}
      labelCol={{ span: 5 }}
      onValuesChange={(_, values) => {
        onValuesChange(values);
      }}
    >
      {showZipName && (
        <Form.Item
          label="作品名称"
          name="zipName"
          rules={[
            { required: true, whitespace: true, message: '请输入作品名称！' },
            { max: 20, message: '作品名称不得超过20个字！' },
          ]}
        >
          <Input placeholder="请输入作品名称" />
        </Form.Item>
      )}
      <Form.Item
        label="当前大小"
        className={css({
          '> .ant-form-item-label': {
            display: 'flex',
            alignItems: 'center',
            // 因为 text-align:right 失效
            justifyContent: 'flex-end',
          },
        })}
      >
        {loading ? (
          '正在计算包体大小...'
        ) : outdated ? (
          '请点击“开始压缩”后查看当前设置下实际大小'
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ paddingRight: 12 }}>{format(size)}M</div>
            <div style={{ color: '#999999', paddingLeft: 12, borderLeft: 'solid 1px #E0E0E0' }}>
              {zipSize &&
                (size > zipSize * 1024 * 1024
                  ? `包体超过${zipSize}M, 请确保推送广告主账号有${zipSize}M以上素材投放权限`
                  : `< ${zipSize}M，可以进入${nextAction}`)}
            </div>
          </div>
        )}
      </Form.Item>
      {[
        { label: '图片质量', name: 'imageQuality' },
        { label: '音频质量', name: 'audioQuality' },
        { label: '视频质量', name: 'videoQuality' },
      ].map(({ label, name }) => (
        <Form.Item label={label} name={name} key={name}>
          <Radio.Group
            className={css({
              display: 'flex',
              '& > label': {
                flex: 'auto',
                textAlign: 'center',
              },
            })}
          >
            <Radio.Button value={10}>原大小</Radio.Button>
            <Radio.Button value={8} disabled={isVRVideo}>
              高
            </Radio.Button>
            <Radio.Button value={6} disabled={isVRVideo}>
              中
            </Radio.Button>
            <Radio.Button value={4} disabled={isVRVideo}>
              低
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
      ))}
    </Form>
  );
}
