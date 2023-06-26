import { useState } from 'react';
import { projectFetchService } from '@shared/api/projectApi/fetch';
import { IMd5 } from '@shared/api/projectApi/types';
import { useParamsQuery } from '@main/hooks/useParamsQuery';
import { usePageParams } from '@main/routes/withPath';
import { withLoading } from '@main/table';
import { QUERY_KEY } from '@main/table/constants';
import { usePagination } from '@main/table/project';
import { Button, Dropdown, message, Modal, Space, Table, Tag, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { IPutParams } from '..';
import defaultImage from '@shared/assets/images/default_image.png';
import style from './style';
import { typeOfPlayMap } from '@editor/Editor/Header/headers/Project/CaseName';
import { TabsContainer } from '@main/pages/views';
import { PLAYABLE_TABS } from '../tabList';
import { Help } from '@icon-park/react';
import { projectActionService } from '@shared/api/projectApi/action';
import { HandoverModal } from './HandoverModal';
import { useHasFeature } from '@shared/userInfo';
import { useStepTwo } from '@editor/Editor/Header/headers/Project/Submit/SyncProduct/SyncDialog';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { syncToAdUpload } from '@editor/Editor/Header/headers/Project/Submit/SyncProduct';
import StepDialog from '@editor/Editor/Header/headers/Project/Submit/SyncProduct/SyncDialog/StepDialog';
import { EyeOutlined } from '@ant-design/icons';
import { downloadBlob } from '@editor/utils';
import Axios from 'axios';
import { http } from '@shared/api';
import PreviewModal from './PreviewModal';

export default withLoading(function ({ loading }) {
  const { params, onParamsChange } = usePageParams<IPutParams>();
  const { list, total, refetch } = useParamsQuery([QUERY_KEY.MY_PUT, params], projectFetchService.Playables, params);
  const [handOverLink, setHandOverLink] = useState<string>('');
  const [syncProjectId, setSyncProjectId] = useState<number>(0);
  const [syncTaskId, setSyncTaskId] = useState<number>(0);
  const [hoverId, setHoverId] = useState<string>();
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const canDownloadZip = useHasFeature('<download_zip>') || params.pageType === 'my';

  const formatSize = (size: number) => {
    if (size === 0) {
      return '0Mb';
    }
    if ((size / 1024 / 1024) * 100 >= 1) {
      return (size / 1024 / 1024).toFixed(2) + 'Mb';
    } else {
      return '<0.01Mb';
    }
  };
  const deletePlayable = async (id: number) => {
    const result = await projectActionService.deletePlayable(id);
    if (result.message === 'success') {
      message.success('删除成功');
      refetch();
    }
  };
  const handoverPlayable = async (id: number) => {
    try {
      const result = await projectActionService.handoverPlayable(id);
      if (result.message === 'success') {
        setHandOverLink(result.data.url);
      } else {
        message.warning(`${result.message}`);
      }
    } catch (err) {
      message.error(`${err}`);
    }
  };
  //素材列表项
  const playableColumns: ColumnProps<IMd5>[] = [
    {
      title: '项目',
      dataIndex: 'projectCover',
      key: 'projectCover',
      width: '15%',
      align: 'center',
      render: (projectCover: string, record: IMd5) => {
        return (
          <div>
            <div
              className={style.coverWrapper}
              onMouseEnter={() => setHoverId(record.id)}
              onMouseLeave={() => setHoverId('')}
            >
              <img src={projectCover || defaultImage} className={style.cover} />
              {hoverId === record.id && ![0, 2].includes(record.status!) && (
                <EyeOutlined
                  className={style.preview}
                  onClick={async () => {
                    try {
                      const { data } = await http.get(
                        `project/syncToAdCompressResult?id=${record.projectId}&taskId=${record.id}`
                      );
                      setPreviewUrl(data.data.previewUrl);
                    } catch (err) {
                      message.error('无法生成预览链接');
                    }
                  }}
                />
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '项目名称及ID',
      dataIndex: 'projectId',
      key: 'projectId',
      width: '15%',
      align: 'left',
      render: (projectId: number, record: IMd5) => {
        const disabled = projectId + '' === params.projectId;
        return (
          <div style={{ userSelect: 'text' }}>
            <div style={{ display: 'flex' }}>
              {record.typeOfPlay && typeOfPlayMap[record.typeOfPlay] ? (
                <Tag
                  style={{
                    padding: '0 4px',
                    lineHeight: '18px',
                    borderRadius: '2px',
                  }}
                  color="#3955f6"
                  children={typeOfPlayMap[record.typeOfPlay]}
                />
              ) : null}
              <Tooltip title={record.projectName}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {record.projectName}
                </div>
              </Tooltip>
            </div>
            <div>
              <div style={{ display: 'flex', margin: '5px 0' }}>
                项目ID:
                <div
                  style={{
                    color: disabled ? '#999999' : '#3955f6',
                    cursor: disabled ? '' : 'pointer',
                  }}
                  onClick={() => {
                    if (!disabled) {
                      onParamsChange({ projectId: projectId + '' });
                    }
                  }}
                >
                  {projectId}
                </div>
              </div>
              <div>素材ID:{record.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: '作者',
      dataIndex: 'projectUserName',
      key: 'author',
      width: '15%',
      align: 'left',
      render: (projectUserName: string, record: IMd5) => {
        return (
          <div style={{ userSelect: 'text' }}>
            <div
              style={{
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Tooltip
                title={
                  <>
                    <div>用户名：{projectUserName}</div>
                    <div>用户id：{record.projectUserId}</div>
                  </>
                }
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  制作：{projectUserName}
                </div>
              </Tooltip>
              <Tooltip
                title={
                  <>
                    <div>用户名：{record.userName}</div>
                    <div>用户id：{record.userId}</div>
                    {params.pageType === 'super' && <div>团队id：{record.builderTeamId}</div>}
                  </>
                }
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '5px' }}>
                  打包：{record.userName}
                </div>
              </Tooltip>
              {params.status === 'handover' && (
                <Tooltip
                  title={
                    <>
                      <div>团队名：{record.receiverTeamName}</div>
                      <div>团队id：{record.receiverTeamId}</div>
                    </>
                  }
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '5px' }}>
                    接收：{record.receiverTeamName}
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'operation',
      width: '13%',
      ellipsis: true,
      render: (id: number, record: IMd5) => {
        const moreMenu = [];
        if (record.builderTeamId === record.receiverTeamId && record.status === 1 && params.status === 'packed') {
          moreMenu.push({ operation: '移交', fn: () => handoverPlayable(id) });
        }
        if (canDownloadZip && record.status !== 2) {
          moreMenu.push({
            operation: '下载zip',
            fn: () => {
              Axios({ url: `${record.url}?forceDownload=true`, responseType: 'blob' }).then(res => {
                downloadBlob(res.data, `${record.taskName}.zip`);
              });
            },
          });
        }
        return (
          <div style={{ display: 'flex' }}>
            <Button
              type="link"
              style={{ padding: 0 }}
              disabled={record.status === 2}
              onClick={() => {
                setSyncProjectId(Number(record.projectId));
                setSyncTaskId(id);
              }}
            >
              同步
            </Button>
            <Button type="link" style={{ padding: 0, margin: '0 3px' }} onClick={() => deletePlayable(id)}>
              删除
            </Button>
            {moreMenu.length !== 0 && (
              <Dropdown
                menu={{
                  items: moreMenu.map((item, index) => ({
                    label: (
                      <Button type="link" style={{ padding: 0 }} onClick={item.fn}>
                        {item.operation}
                      </Button>
                    ),
                    key: index,
                  })),
                }}
              >
                <Button type="link" style={{ padding: 0 }}>
                  更多
                </Button>
              </Dropdown>
            )}
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      ellipsis: true,
      render: (status: number, record: IMd5) => {
        enum statusMap {
          '成功' = 1,
          '失败' = 2,
        }
        enum PlayableStatus {
          '校验中' = 0,
          '校验不通过' = 1,
          '校验通过' = 2,
          '审核不通过' = 3,
          '审核通过' = 4,
        }
        return (
          <>
            {params.status === 'packed' && (
              <div
                style={{
                  padding: '6px',
                  background: 'none',
                  userSelect: 'text',
                  display: 'flex',
                }}
              >
                <div>{statusMap[status]}</div>
                {status === 2 && (
                  <Tooltip title={record.message}>
                    <Help theme="outline" size="15" fill="#333" style={{ display: 'flex', alignItems: 'center' }} />
                  </Tooltip>
                )}
              </div>
            )}
            {params.status === 'sync' && <div>{PlayableStatus[record.syncStatus as number]}</div>}
          </>
        );
      },
    },
    {
      title: '包体',
      dataIndex: 'beforeSize',
      key: 'beforeSize',
      width: '12%',
      ellipsis: true,
      render: (beforeSize: string, record: IMd5) => (
        <Space
          direction="vertical"
          style={{
            fontSize: '13px',
          }}
        >
          <div>压缩前:{formatSize(Number(beforeSize))}</div>
          <div>压缩后:{formatSize(Number(record.afterSize))}</div>
        </Space>
      ),
    },
    {
      title: '首屏',
      dataIndex: 'firstSceneSize',
      key: 'firstSceneSize',
      width: '12%',
      ellipsis: true,
      render: (firstSceneSize: string) => (
        <div style={{ padding: '6px', background: 'none', userSelect: 'text' }}>
          {formatSize(Number(firstSceneSize))}
        </div>
      ),
    },
    {
      title: '素材',
      dataIndex: 'imageSize',
      key: 'imageSize',
      width: '12%',
      ellipsis: true,
      render: (imageSize: string, record: IMd5) => {
        return (
          <Space
            direction="vertical"
            style={{
              fontSize: '13px',
            }}
          >
            <div>图片:{formatSize(Number(imageSize))}</div>
            <div>音频:{formatSize(Number(record.audioSize))}</div>
            <div>视频:{formatSize(Number(record.videoSize))}</div>
          </Space>
        );
      },
    },
    {
      title: '压缩质量',
      dataIndex: 'levels',
      key: 'levels',
      width: '10%',
      ellipsis: true,
      render: (levels: string) => {
        const levelArr = levels.split('_');
        enum quality {
          '原' = 10,
          '高' = 8,
          '中' = 6,
          '低' = 4,
        }
        return (
          <Space
            direction="vertical"
            style={{
              fontSize: '13px',
            }}
          >
            <div>图片:{quality[levelArr[0] as any]}</div>
            <div>音频:{quality[levelArr[1] as any]}</div>
            <div>视频:{quality[levelArr[2] as any]}</div>
          </Space>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      ellipsis: true,
      render: (createdAt: string) => (
        <div style={{ padding: '6px', background: 'none', userSelect: 'text' }}>{createdAt}</div>
      ),
    },
  ];
  const getExcludeColumns = () => {
    const excludes: Array<string> = [];
    switch (params.status) {
      case 'packing':
        excludes.push('operation', 'status');
        break;
      case 'packed':
      case 'sync':
        break;
      case 'handover':
        excludes.push('operation', 'status');
        break;
      default:
        break;
    }
    switch (params.pageType) {
      case 'my':
        excludes.push('author');
        break;
      default:
        break;
    }
    return excludes;
  };
  return (
    <div className={style.container}>
      <TabsContainer
        value={params.status}
        options={PLAYABLE_TABS}
        onChange={tab => {
          onParamsChange({ status: tab, page: 1 });
        }}
      >
        <Table
          rowKey="id"
          columns={playableColumns.filter(item => !getExcludeColumns().includes(item.key as string))}
          dataSource={list}
          className={style.table}
          loading={loading}
          pagination={usePagination(total)}
        />
      </TabsContainer>
      {handOverLink !== '' && <HandoverModal data={handOverLink} onClose={() => setHandOverLink('')} />}
      {previewUrl !== '' && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl('')} />}
      {syncProjectId !== 0 && (
        <StepDialog
          title="同步作品至广告投放平台（AD）"
          action="同步"
          onCancel={() => setSyncProjectId(0)}
          onConfirm={async values => {
            const startTime = Date.now();
            const { succeeded, results, playableUrls } = await syncToAdUpload(syncProjectId, {
              ...values,
              taskId: syncTaskId,
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
            }
          }}
          useStepHooks={[useStepTwo]}
        />
      )}
    </div>
  );
});
