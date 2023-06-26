import React, { useState, memo } from 'react';
import Icon, { ExclamationCircleFilled, QuestionCircleOutlined } from '@ant-design/icons';
import { checkPlayableAreaAll, ICaseState, useImbot, useProject } from '@editor/aStore';
import { getMainScene, collectEvent, EventTypes, pickupScenes } from '@editor/utils';
import { LinkTwo } from '@icon-park/react';
import { message, Modal, Tooltip } from 'antd';
import HeaderButton from '../../HeaderButton';
import SyncDialog from './SyncDialog';
import SyncReport from './SyncReport';
import { SubmitProps } from '..';
import { http } from '@shared/api';

export const analyze = (project: ICaseState) => {
  const main = getMainScene(project.scenes);
  const firstInteractionTime = Math.round(
    Math.min(
      0,
      Math.min(
        ...Object.values(main.props)
          .filter(({ type }) => type === 'Script')
          .map(({ time = 0 }) => time)
      )
    ) / 1000
  );
  const downloadBtnAllShow = Object.values(main.props).some(({ type }) => type === 'Button');
  const idSet = pickupScenes(project, main).scenes.reduce((set, { props }) => {
    for (const { type, url } of Object.values(props)) {
      if (type === 'Animation' && typeof url === 'string') {
        const params = new URLSearchParams(url.slice(url.indexOf('?')));
        const mid = params.get('mid');
        if (mid) {
          set.add(mid);
        }
      }
    }
    return set;
  }, new Set<string>());
  return {
    firstInteractionTime,
    downloadBtnAllShow,
    componentIds: Array.from(idSet),
  };
};

export default memo(({ disabled, onSaving, getState }: SubmitProps) => {
  const [succeeded, setSucceeded] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState([] as any[]);
  const { typeOfPlay } = useProject('settings');
  const { showImDialog } = useImbot();
  return (
    <React.Fragment>
      <HeaderButton
        icon={<Icon component={LinkTwo as any} />}
        disabled={disabled}
        onClick={async () => {
          collectEvent(EventTypes.OperationButton, {
            type: '同步',
          });
          try {
            await onSaving('同步');
            if (typeOfPlay !== 3) {
              return setSyncing(true);
            }

            const warning = checkPlayableAreaAll(getState().project);
            if (!warning) {
              return setSyncing(true);
            }
            Modal.confirm({
              autoFocusButton: null,
              title: '警示',
              icon: <ExclamationCircleFilled />,
              content: `${warning}，可能会影响互动效果，建议确认后再同步`,
              cancelText: '去检查',
              okText: '直接同步',
              onCancel: console.log,
              onOk: () => setSyncing(true),
            });
          } catch (e) {
            message.error(e.message);
          }
        }}
      >
        同步{' '}
        <Tooltip
          arrowPointAtCenter
          placement="bottomRight"
          title="将当前作品打包并同步至AD平台（无需导出再上传），审核、配置投放等操作请在AD平台完成。"
        >
          <QuestionCircleOutlined
            onClick={event => {
              event.preventDefault();
              showImDialog('同步');
            }}
          />
        </Tooltip>
      </HeaderButton>
      {syncing && (
        <SyncDialog
          onCancel={() => setSyncing(false)}
          onSaving={onSaving}
          onConfirm={async values => {
            const startTime = Date.now();
            const { project } = getState();
            const { succeeded, results, playableUrls } = await syncToAdUpload(project.id, {
              ...values,
              firstInteractionTime: 0,
              downloadBtnAllShow: false,
              componentIds: [],
            });
            const endTime = Date.now();
            const loadingTime = +((endTime - startTime) / 1000).toFixed(1);
            collectEvent(EventTypes.SyncLoadingTime, {
              duration: loadingTime,
            });
            collectEvent(EventTypes.ProductStatus, {
              type: 1,
            });
            setSyncing(false);
            if (playableUrls.length) {
              Modal.info({
                width: 600,
                title: `成功将素材推送给${succeeded}个广告主`,
                content: playableUrls.map((playableUrl, index) => (
                  <div key={index} style={{ userSelect: 'text' }}>
                    {playableUrl}
                  </div>
                )),
              });
            } else if (!results.length) {
              message.success(`成功将素材推送给${succeeded}个广告主`);
            } else {
              setSucceeded(succeeded);
              setResults(results);
            }
          }}
        />
      )}
      {results.length > 0 && (
        <SyncReport
          succeeded={succeeded}
          results={results}
          onCancel={() => {
            setResults([]);
          }}
        />
      )}
    </React.Fragment>
  );
});

export const syncToAdUpload = async (
  id: number,
  { granted, taskId, authed, ...others }: { taskId: number; granted: string[]; authed: string[] }
) => {
  const {
    data: {
      data: { unExistAdvIds, unAuthAdvIds, failedAdvIds, authToken },
    },
  } = await http.post('user/advListAuth', { advIds: granted.filter(id => !authed.includes(id)) });
  const validIds = granted.filter(id => [unAuthAdvIds, unExistAdvIds, failedAdvIds].every(ids => !ids.includes(id)));
  const playableUrls: string[] = [];
  let succeeded = 0;
  const results = [
    { aadvids: unExistAdvIds, message: '该ID不存在', action: '请核查后重新推送' },
    { aadvids: failedAdvIds, message: '网络或其他原因', action: '请核查后重新推送' },
    {
      aadvids: unAuthAdvIds,
      message: '未获得广告主的推送授权',
      action: '请将以下链接发给对应的广告主申请推送权限',
      grantUrl: `https://cc.oceanengine.com/push/adv-auth?token=${authToken}&from=rubbex`,
    },
  ].filter(({ aadvids }) => aadvids.length);
  if (validIds.length) {
    const {
      data: {
        data: { uploadList },
      },
    } = await http.post('project/syncToAdUpload', { id, taskId, granted: validIds, ...others });
    const projectId = id;
    await Promise.all(
      uploadList.map(async ({ id, advId }: any) => {
        while (true) {
          const {
            data: {
              data: { status, message, playableUrl },
            },
          } = await new Promise<any>((resolve, reject) => {
            setTimeout(async () => {
              try {
                resolve(
                  await http.get(
                    `project/syncToAdUploadResult?uploadId=${id}&taskId=${taskId}&id=${projectId}&advId=${advId}`
                  )
                );
              } catch (e) {
                reject(e);
              }
            }, 3000);
          });
          if (status === 1) {
            const error = results.find(error => error.message === message);
            if (error) {
              return error.aadvids.push(advId);
            } else {
              return results.push({ aadvids: [advId], message, action: '请核查后重新推送' });
            }
          } else if (status) {
            playableUrls.push(playableUrl);
            return succeeded++;
          }
        }
      })
    );
  }
  return {
    playableUrls,
    succeeded,
    results,
  };
};
