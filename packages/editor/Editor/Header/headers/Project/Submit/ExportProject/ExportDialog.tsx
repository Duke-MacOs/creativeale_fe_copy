import { http } from '@shared/api';
import { amIHere, copyText } from '@shared/utils';
import { downloadUri } from '@editor/utils';
import { message, Modal } from 'antd';
import Axios from 'axios';
import moment from 'moment';
import { useStore } from 'react-redux';
import { triggerExportSuccess } from '../ExportHistory';
import { addHistory } from '../ExportHistory/storage';
import { getUseStepOne } from '../SyncProduct/SyncDialog';
import StepDialog from '../SyncProduct/SyncDialog/StepDialog';
import useStepZero from './useStepZero';
import JSZip from 'jszip';
import { useHasFeature } from '@shared/userInfo';
import { useEventBus } from '@byted/hooks';

const downloadLightPlay = async (uri: string) => {
  const basePath = uri.replace('.zip', '/');
  const {
    data: { pgc, res },
  } = await Axios.get(`${basePath}light_data.json`);
  const data = {
    entry: `${basePath}riko.js`,
    resources: `${basePath}resources.json`,
    config: {
      basePath,
      pgc,
      res,
    },
  };
  downloadUri(`data:application/json,${encodeURI(JSON.stringify({ data }, undefined, 2))}`);
};

interface Props {
  onSaving(): Promise<void>;
  onCancel: () => void;
}
export default ({ onCancel, onSaving }: Props) => {
  const { getState } = useStore<EditorState>();
  const hasClabFeature = useHasFeature();
  useEventBus('abortCompressing', onCancel);

  return (
    <StepDialog
      title="导出项目"
      action="导出"
      onCancel={onCancel}
      onConfirm={async ({ downloadUrl, exportUrl, QRCodeUrl, region, zipUrl, removeSDK }) => {
        try {
          const isLightPlay = getState().project.settings.typeOfPlay === 2;
          const projectId = getState().project.id;
          debugger;
          if (removeSDK) {
            await uploadRubeexTos(downloadUrl);
          } else if (exportUrl) {
            if (!isLightPlay) {
              // 落地页导出url时，如果勾选了导出H5时则不包含sdk，不走rubeex提供的接口
              await uploadRubeexPlayable({ zipUrl: downloadUrl, region }, projectId, {
                QRCodeUrl,
                zipUrl,
              });
            } else {
              await downloadLightPlay(downloadUrl);
            }
          } else {
            if (/\.zip$/.test(downloadUrl)) {
              if (isLightPlay) {
                const buffer = await fetch(downloadUrl).then(res => res.arrayBuffer());
                const json = await (await JSZip.loadAsync(buffer)).file('./light_data.json')?.async('string');

                Modal.success({
                  title: '导出成功',
                  content: '已成功复制轻互动配置到剪切板，点击确定按钮跳转到轻互动预览界面',
                  okText: '确定',
                  onOk() {
                    copyText(json, {
                      onCopySuccess: () => {
                        window.open(['https://light-play-boe', 'bytedance', 'net/'].join('.'), '休闲互动');
                      },
                    });
                  },
                });
              }
              downloadUri(downloadUrl);
              addHistory({ QRCodeUrl, zipUrl });
            } else {
              triggerExportSuccess({ content: downloadUrl, exportHistoryData: { QRCodeUrl, zipUrl } });
            }
            // 上报导出时间，用于统计项目制作时长
            const id = getState().project.id;
            await http.post(`disclosure/projectDuration/${id}/updateSyncDateList`, {
              syncDate: moment().format('YYYY-MM-DD HH:mm:ss'),
            });
          }
          onCancel();
        } catch (error) {
          message.error(error.message);
        }
      }}
      useStepHooks={
        amIHere({ release: false }) || hasClabFeature
          ? [useStepZero, getUseStepOne({ onSaving, showZipName: false, exportOnly: true })]
          : [getUseStepOne({ onSaving, showZipName: false, exportOnly: true })]
      }
    />
  );
};

export const uploadRubeexPlayable = async (
  params: any,
  projectId?: number,
  exportHistoryData?: FirstParam<typeof triggerExportSuccess>['exportHistoryData']
): Promise<void> => {
  const {
    data: {
      data: { id },
    },
  } = await http.post('project/uploadRubeexPlayable', params);
  while (true) {
    const {
      data: { data },
    } = await new Promise<any>((resolve, reject) =>
      setTimeout(async () => {
        try {
          resolve(
            await http.get('project/uploadRubeexPlayableResult', {
              params: { id, projectId, region: params.region },
            })
          );
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

export async function uploadRubeexTos(zipUrl: string) {
  const { data } = await fetch('/api/faas/uploadZip', {
    method: 'Post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ zipUrl }),
  }).then(res => res.json());
  if (data) {
    triggerExportSuccess({ content: data });
  }
}
