import { useState, ReactNode, useLayoutEffect } from 'react';
import { Alert, Button, Input, message } from 'antd';
import { ErrorBoundary } from './ErrorBoundary';
import { TreeModal } from './TreeModal';
import { css } from 'emotion';

export interface ErrorFallbackProps {
  children: ReactNode;
  value?: any;
  onChange?: (value: any) => void;
}

export const ErrorFallback = ({ children, onChange, value }: ErrorFallbackProps) => {
  const [error, setError] = useState<Error | undefined>();
  useLayoutEffect(() => () => setError(undefined), [value]);
  return (
    <ErrorBoundary
      hasError={error !== undefined}
      onError={setError}
      fallback={() => <Fallback error={error} value={value} onChange={onChange} />}
    >
      {children}
    </ErrorBoundary>
  );
};

const Fallback = ({ error, onChange, value }: any) => {
  const [detail, setDetail] = useState<ReactNode>(null);
  return (
    <>
      <Alert
        showIcon
        type="error"
        message={error?.message ?? String(error)}
        action={
          <Button
            size="small"
            danger
            onClick={() => {
              if (onChange) {
                setDetail(
                  <Recoverer
                    value={value}
                    onChange={(json: string) => {
                      try {
                        const value = JSON.parse(json);
                        onChange(value);
                      } catch (error) {
                        message.error(`修复失败：${error.message}`);
                      } finally {
                        setDetail(null);
                      }
                    }}
                  />
                );
              } else {
                setDetail(
                  <TreeModal
                    width={520}
                    title="错误详情"
                    onCancel={() => setDetail(null)}
                    children={
                      <div className={css({ padding: '16px 16px 0' })}>
                        <Alert.ErrorBoundary>
                          <ThrowError error={error} />
                        </Alert.ErrorBoundary>
                      </div>
                    }
                  />
                );
              }
            }}
          >
            {onChange ? '修复' : '详情'}
          </Button>
        }
      />
      {detail}
    </>
  );
};

const Recoverer = ({ value, onChange }: any) => {
  const [json, setJson] = useState(JSON.stringify(value));
  return (
    <TreeModal
      title="修复数据"
      onCancel={() => onChange(json)}
      children={
        <div className={css({ padding: '16px 16px 0' })}>
          <Input.TextArea value={json} onChange={({ target: { value } }) => setJson(value)} />
        </div>
      }
    />
  );
};

const ThrowError = ({ error }: any) => {
  throw error;
};
