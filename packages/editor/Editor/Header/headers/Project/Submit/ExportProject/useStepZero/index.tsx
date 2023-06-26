import { useState } from 'react';
import { useEventBus } from '@byted/hooks';
import { Checkbox, Form, FormInstance, Radio } from 'antd';
import { StepHookReturn } from '../../SyncProduct/SyncDialog/StepDialog';
import { TargetView, SaveAstView } from './TargetView';
import { css } from 'emotion';
import { useSettings } from '@editor/aStore';
import { useHasFeature } from '@shared/userInfo';

export default (form: FormInstance<any>): StepHookReturn => {
  const { trigger } = useEventBus('ExportSettings');
  const exportH5 = useHasFeature('<export_as_h5>');
  const typeOfPlay = useSettings('typeOfPlay');
  const [initialValues, setInitialValues] = useState(() => {
    const values = {
      region: 'mainland',
      exportAs: 'landingPage',
      thumbnail: true,
      playable_orientation: 1,
      exportAsLynx: false,
      removeSDK: false,
    };
    try {
      return { ...values, ...JSON.parse(sessionStorage.getItem('exportOptions')!) };
    } catch {
      return values;
    }
  });
  return {
    title: '选择导出设置',
    okDisabled: false,
    cancelDisabled: false,
    spinning: false,
    element: (
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 24 }}>
          <Form.Item label="选择投放区域" name="region">
            <TargetView />
          </Form.Item>
          <Form.Item label="选择投放类型" name="exportAs">
            <SaveAstView />
          </Form.Item>
        </div>
        <div
          className={css({
            display: 'flex',
            alignItems: 'flex-end',
            columnGap: 24,
            '> div': {
              marginBottom: 0,
            },
          })}
        >
          <Form.Item label="横竖屏设置" name="playable_orientation">
            <Radio.Group
              optionType="button"
              options={[
                { label: '横屏', value: 2 },
                { label: '竖屏', value: 1 },
                { label: '横竖屏', value: 0 },
              ]}
            />
          </Form.Item>
          <Form.Item name="thumbnail" valuePropName="checked">
            <Checkbox>使用缩略图加快首屏渲染</Checkbox>
          </Form.Item>
          {exportH5 && typeOfPlay === 0 && (
            <Form.Item name="removeSDK" valuePropName="checked">
              <Checkbox>导出为H5</Checkbox>
            </Form.Item>
          )}
          {typeOfPlay !== 0 && (
            <Form.Item name="exportAsLynx" valuePropName="checked">
              <Checkbox>导出为Lynx格式</Checkbox>
            </Form.Item>
          )}
        </div>
      </Form>
    ),
    async mapValues(values: any) {
      setInitialValues(values);
      sessionStorage.setItem('exportOptions', JSON.stringify(values));
      trigger(values);
      return {
        removeSDK: values.removeSDK,
      };
    },
  };
};
