import { http } from '@shared/api';
import { useSettings } from '@editor/aStore';
import { message } from 'antd';
import { useStore } from 'react-redux';
import { triggerExportSuccess } from '../ExportHistory';
import { getUseStepOne } from '../SyncProduct/SyncDialog';
import StepDialog from '../SyncProduct/SyncDialog/StepDialog';
import useStepZero from './useStepZero';

interface Props {
  onSaving(): Promise<void>;
  onCancel: () => void;
}
export default ({ onCancel, onSaving }: Props) => {
  const { getState } = useStore<EditorState>();
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;

  return (
    <StepDialog
      title="生成投放URL"
      action={isVRVideo ? '获取lynx链接' : '生成URL'}
      onCancel={onCancel}
      onConfirm={async ({ downloadUrl, QRCodeUrl, zipUrl, lynxUrl }) => {
        if (isVRVideo || lynxUrl) {
          triggerExportSuccess({ content: lynxUrl, exportHistoryData: { QRCodeUrl, zipUrl } });
        } else {
          if (/\.zip$/.test(downloadUrl)) {
            try {
              await uploadRubeexPlayable({ zipUrl: downloadUrl }, getState().project.id, {
                QRCodeUrl,
                zipUrl,
              });
              onCancel();
            } catch (error) {
              message.error(error.message);
            }
          } else {
            triggerExportSuccess({ content: downloadUrl, exportHistoryData: { QRCodeUrl, zipUrl } });
          }
        }
      }}
      useStepHooks={
        isVRVideo
          ? [
              getUseStepOne({
                onSaving,
                nextAction: '获取lynx链接',
                showZipName: false,
                exportOnly: true,
              }),
            ]
          : [
              useStepZero,
              getUseStepOne({
                onSaving,
                nextAction: '生成URL',
                showZipName: false,
                exportOnly: true,
              }),
            ]
      }
    />
  );
};

export const uploadRubeexPlayable = async (
  data: any,
  projectId?: number,
  exportHistoryData?: FirstParam<typeof triggerExportSuccess>['exportHistoryData']
): Promise<void> => {
  const {
    data: {
      data: { id },
    },
  } = await http.post('project/uploadRubeexPlayable', data);
  while (true) {
    const {
      data: { data },
    } = await new Promise((resolve, reject) =>
      setTimeout(async () => {
        try {
          resolve(await http.get('project/uploadRubeexPlayableResult', { params: { id, projectId } }));
        } catch (e) {
          reject(e);
        }
      }, 300)
    );
    if (data.status === 2 && data.url) {
      return new Promise<void>(resolve =>
        triggerExportSuccess({ content: data.url, onOk: resolve, exportHistoryData })
      );
    }
  }
};
