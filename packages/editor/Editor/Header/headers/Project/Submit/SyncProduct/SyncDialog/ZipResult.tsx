import React from 'react';
import Warnings from './Warnings';
import { Form } from 'antd';
import { useZipQRCode } from '../../../Preview/useQRCode';
import { useEditor } from '@editor/aStore';
import { css } from 'emotion';

interface StepOneProps {
  hasWarnings: React.MutableRefObject<number>;
  playableError?: string;
  firstSceneSize?: number;
  QRCodeUrl: string; // 二维码url
  outdated: boolean;
}

export const format = (size: number) => Math.max(size / 1024 / 1024, 0.1).toFixed(1);

export default function StepOne({ firstSceneSize, playableError, QRCodeUrl, outdated, hasWarnings }: StepOneProps) {
  const dataUrl = useZipQRCode(QRCodeUrl, { width: 132 });
  const { sceneMode } = useEditor(0, 'sceneMode');
  return (
    <Form
      colon={false}
      labelAlign="left"
      wrapperCol={{ span: 19 }}
      labelCol={{ span: 5 }}
      className={css({
        maxHeight: 350,
        overflow: 'auto',
        paddingLeft: 20,
        '::-webkit-scrollbar': {
          display: 'none',
        },
      })}
    >
      {sceneMode !== 'Product' && <Warnings firstSceneSize={firstSceneSize} hasWarnings={hasWarnings} />}
      <Form.Item label="预览二维码">
        <div style={{ paddingTop: 6 }}>
          请用「抖音」App扫码预览
          <div style={{ color: '#999', fontSize: 12, padding: '8px 0' }}>「抖音」请用21.6.0以上版本扫码</div>
          <div style={{ width: 132, height: 132, position: 'relative' }}>
            <img src={dataUrl} style={{ opacity: outdated || playableError ? 0.2 : 1 }} />
            {(outdated || playableError) && (
              <div
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'absolute',
                  textAlign: 'center',
                  overflow: 'hidden',
                  display: 'flex',
                  height: 132,
                  width: 132,
                  left: 0,
                  top: 0,
                }}
              >
                {outdated ? (
                  <div>
                    请点击“开始压缩”
                    <br />
                    后查看最新预览
                  </div>
                ) : (
                  playableError
                )}
              </div>
            )}
          </div>
        </div>
      </Form.Item>
    </Form>
  );
}
