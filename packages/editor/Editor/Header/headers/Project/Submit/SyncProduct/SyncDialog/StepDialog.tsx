import React, { useState } from 'react';
import { Modal, Steps, Form, message, Spin } from 'antd';
import { Close } from '@icon-park/react';
import Icon from '@ant-design/icons';
import Footer from './Footer';
import { collectEvent, EventTypes } from '@editor/utils';
import { Result } from './useCompress';
import { css } from 'emotion';

export type StepHookReturn = {
  title: string;
  okDisabled: boolean;
  cancelDisabled: boolean;
  spinning: boolean;
  element: React.ReactNode;
  mapValues(values: any): Promise<any>;
  // 压缩结果的大小和时长
  result?: Result;
  footer?: React.ReactNode;
  spinTip?: string;
};
export interface StepDialogProps<T = any> {
  onConfirm(values: T): Promise<void>;
  onCancel(): void;
  title: string;
  action: string;
  useStepHooks: Array<(form: any, current: boolean) => StepHookReturn>;
}

export default function StepDialog<T = any>({ onConfirm, onCancel, title, action, useStepHooks }: StepDialogProps<T>) {
  const [oneValues, setValues] = useState({} as T);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const steps = useStepHooks.map((use, index) => use(form, index === currentStep));
  const footer = (
    <Footer
      cancelText={currentStep ? '上一步' : '取消'}
      okText={currentStep === steps.length - 1 ? action : '下一步'}
      okDisabled={steps[currentStep].okDisabled}
      cancelDisabled={steps[currentStep].cancelDisabled}
      footer={steps[currentStep].footer}
      onCancel={() => {
        if (currentStep) {
          setCurrentStep(currentStep - 1);
        } else {
          onCancel();
        }
      }}
      onOk={async setLoading => {
        try {
          setLoading(true);
          const values = await form.validateFields();
          const newValues = await steps[currentStep].mapValues(values);
          if (currentStep < steps.length - 1) {
            setValues(oldValues => ({ ...oldValues, ...newValues }));
            setCurrentStep(currentStep + 1);
          } else {
            const { result } = steps[currentStep];
            if (result) {
              const { duration, afterSize: size } = result;
              if (duration && size) {
                collectEvent(EventTypes.CompressProduct, {
                  size: +(size / 1024 / 1024).toFixed(1),
                  duration: +(duration / 1000).toFixed(1),
                });
              }
            }
            await onConfirm({
              ...oneValues,
              ...newValues,
            });
            onCancel();
          }
        } catch (error) {
          message.error(error.message || `${action}'失败'`);
        } finally {
          setLoading(false);
        }
      }}
    />
  );
  return (
    <Modal
      open
      width={1000}
      footer={footer}
      title={title}
      closeIcon={<Icon component={Close as any} />}
      onCancel={onCancel}
    >
      <Spin spinning={steps[currentStep].spinning} tip={steps[currentStep].spinTip}>
        <Steps
          current={currentStep}
          className={css({
            marginTop: 20,
            '.ant-steps-item:last-child': {
              flex: 1,
            },
          })}
          onChange={step => {
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        >
          {steps.map(({ title }, index) => (
            <Steps.Step key={index} title={title} disabled={index > currentStep} />
          ))}
        </Steps>
        <br />
        {steps[currentStep].element}
      </Spin>
    </Modal>
  );
}
