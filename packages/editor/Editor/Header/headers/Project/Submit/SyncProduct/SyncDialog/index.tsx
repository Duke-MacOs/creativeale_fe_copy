import { useRef, useState } from 'react';
import { Button, Modal } from 'antd';
import { Phone, SettingTwo } from '@icon-park/react';
import Icon from '@ant-design/icons';
import useCompress from './useCompress';
import useOptions from './useOptions';
import ZipResult, { format } from './ZipResult';
import StepTwo from './StepTwo';
import Settings from './Settings';
import StepHooks from './StepDialog';
import { css } from 'emotion';
import { setSettings, useProject } from '@editor/aStore';
import { useStore } from 'react-redux';
import useStepZero from './useStepZero';
import useStepZeroDirectPlay from './useStepZeroDirectPlay';
import { useEventBus } from '@byted/hooks';

export interface SyncDialogProps {
  onConfirm(values: any): Promise<void>;
  onCancel(): void;
  onSaving: any;
}

export const getUseStepOne =
  ({
    onSaving,
    showZipName = false,
    exportOnly = false,
    title = '压缩与真机效果预览',
    nextAction,
    headerTitle = showZipName ? '名称与压缩设置' : '压缩设置',
  }: {
    onSaving: () => Promise<void>;
    showZipName?: boolean;
    exportOnly?: boolean;
    title?: string;
    headerTitle?: string;
    loadingStruct?: any;
    nextAction?: string;
  }) =>
  (form: any, current: boolean) => {
    const { getState, dispatch } = useStore<EditorState, EditorAction>();
    const [loading, setLoading] = useState(false);
    const hasWarnings = useRef<number>(0);
    const {
      id,
      name,
      settings: { compressOptions, typeOfPlay, category },
    } = getState().project;
    const { compressing, result, outdated, guessSize, oneValues, exportSettings, onCompress, setValues } = useCompress(
      id,
      current,
      exportOnly,
      compressOptions
    );
    const isVRVideo = typeOfPlay === 3 && category === 3;
    return {
      result,
      title,
      okDisabled: compressing || loading,
      cancelDisabled: compressing || loading,
      spinTip: '素材包压缩中，请耐心等待...',
      spinning: compressing || loading,
      element: (
        <div
          className={css({
            display: 'flex',
            '& label': {
              color: '#999999',
            },
          })}
        >
          <div style={{ flex: '1 1 0', paddingRight: 48, borderRight: 'solid 1px #E4E9ED' }}>
            <StepHeader
              Icon={SettingTwo}
              message="包体大小会影响加载效率，建议压缩"
              title={headerTitle}
              paddingLeft={16}
            />
            <Settings
              form={form}
              loading={compressing}
              showZipName={showZipName}
              nextAction={nextAction}
              initialValues={{
                zipName: name,
                ...oneValues,
              }}
              zipSize={typeOfPlay === 3 ? undefined : 3}
              size={result?.afterSize || 0}
              outdated={outdated}
              onValuesChange={values => {
                setValues((oldValues: any) => ({ ...oldValues, ...values }));
              }}
              isVRVideo={isVRVideo}
            />
            <CompressButton guessSize={guessSize} onCompress={onCompress} />
          </div>
          <div style={{ flex: '1 1 0', paddingLeft: 28 }}>
            <StepHeader Icon={Phone} title="压缩效果" paddingLeft={20} />
            <ZipResult
              firstSceneSize={result?.firstSceneSize}
              hasWarnings={hasWarnings}
              playableError={result?.playableError}
              QRCodeUrl={result?.feedPlayablePreviewUrl || result?.previewUrl || ''}
              outdated={outdated}
            />
          </div>
        </div>
      ),
      async mapValues(values: any) {
        const todo = async () => {
          setLoading(true);
          try {
            const newResult = outdated || !result ? await onCompress() : result;
            if (newResult.playableError) {
              throw new Error(newResult.playableError);
            }
            dispatch(setSettings({ compressOptions: values }));
            await onSaving();
            return {
              region: exportSettings.region,
              taskId: newResult?.id || '',
              downloadUrl: newResult.playableUrl || newResult.url,
              exportUrl: !exportSettings.exportAsLynx && exportSettings.removeSDK,
              QRCodeUrl: result?.feedPlayablePreviewUrl || result?.previewUrl || '',
              zipUrl: result?.url,
              lynxUrl: newResult?.lynxUrl,
            };
          } finally {
            setLoading(false);
          }
        };
        if (hasWarnings.current) {
          return new Promise<ReturnType<typeof todo>>((resolve, reject) => {
            Modal.confirm({
              title: '风险提示',
              content: `当前还有${hasWarnings.current}个风险未处理，可能会影响投放效果，是否继续${
                exportOnly ? '导出' : '同步'
              }？`,
              cancelText: '继续',
              okText: '取消',
              onCancel() {
                resolve(todo());
              },
              onOk() {
                reject(new Error(`风险未处理，${exportOnly ? '导出' : '同步'}已取消`));
              },
            });
          });
        } else {
          return todo();
        }
      },
    };
  };

export const useStepTwo = (form: any) => {
  const { loading, options } = useOptions();
  const [searching, setSearching] = useState(false);
  return {
    title: '选择推送广告主',
    okDisabled: searching,
    cancelDisabled: searching,
    spinning: false,
    element: (
      <StepTwo form={form} loading={loading} options={options} searching={searching} setSearching={setSearching} />
    ),
    async mapValues(values: any) {
      return {
        granted: values.granted,
        authed: options.map(({ id }) => id),
      };
    },
  };
};

export default function SyncDialog({ onConfirm, onCancel, onSaving }: SyncDialogProps) {
  const { typeOfPlay } = useProject('settings');
  useEventBus('abortCompressing', onCancel);

  return (
    <StepHooks
      title="同步作品至广告投放平台（AD）"
      action="同步"
      onCancel={onCancel}
      onConfirm={values => onConfirm(values)}
      useStepHooks={[
        ...(typeOfPlay === 3 ? [useStepZeroDirectPlay] : [useStepZero]),
        getUseStepOne({
          onSaving,
          showZipName: true,
        }),
        useStepTwo,
      ]}
    />
  );
}
export const StepHeader = ({ title, Icon: Component, message, paddingLeft = 0 }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: `0 0 24px ${paddingLeft}px` }}>
    <div style={{ fontSize: 16, paddingRight: 12, fontWeight: 500 }}>
      <Icon component={Component} /> {title}
    </div>
    {message && (
      <div style={{ flex: 'auto', color: '#999999', paddingLeft: 12, borderLeft: 'solid 1px #E0E0E0' }}>{message}</div>
    )}
  </div>
);

const CompressButton = ({ onCompress, guessSize }: any) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
    <div style={{ paddingRight: 16 }}>预估大小：{format(guessSize)}M</div>
    <Button onClick={onCompress}>开始压缩</Button>
  </div>
);
