import { message, Tag, Tooltip, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ProjectModal } from './ProjectModal';
import { IProjectFromServer, ProjectStatus } from '../api';
import { collectEventTableAction } from '@main/collectEvent';
import type { GetProjectColumn } from '.';
import { IUserInfo } from '@shared/types';
import newTag from './new_tag.gif';
import { http } from '@shared/api';
import { css } from 'emotion';

const typeOfPlayMap: Record<number, any> = {
  0: '落地页',
  1: '直玩',
  2: '轻互动',
  3: '直出',
  4: '视频',
};

export const categoryMap: Record<number, any> = {
  0: '2D项目',
  1: '3D项目',
  2: 'VR看房',
  3: 'VR视频',
  4: '3D看车',
};

export const editableStatus = (
  { status, teamId }: Pick<IProjectFromServer, 'status' | 'teamId'>,
  { teams }: IUserInfo
) => {
  switch (status) {
    case ProjectStatus.ExampleApproving:
    case ProjectStatus.ExampleApproved:
    case ProjectStatus.Approving:
    case ProjectStatus.Approved:
      return false;
    default:
      return teams.some(({ id }) => id === teamId);
  }
};

export const nameAndId: GetProjectColumn = ({ userInfo, onQueryProject, onUpdateProject, renderReactNode }) => ({
  title: '名称及ID',
  width: '20%',
  ellipsis: true,
  key: 'nameAndId',
  render: (
    _,
    {
      id,
      name,
      newest,
      editor,
      teamId,
      description,
      templateId,
      typeOfPlay = 0,
      category = 0,
      cover,
      status,
      industry,
      deleted,
    }
  ) => {
    const className = css({ cursor: 'pointer', textAlign: 'center' });
    return (
      <div style={{ userSelect: 'text' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={css({ overflow: 'hidden', textOverflow: 'ellipsis' })}>
            <Tooltip title={name}>
              {newest && (
                <>
                  <img style={{ height: 14 }} src={newTag} />{' '}
                </>
              )}
              {name}
            </Tooltip>
          </div>
          {!deleted && editableStatus({ status, teamId }, userInfo) && editor === userInfo.userId && (
            <>
              &nbsp;
              <Tooltip title="修改项目信息">
                <Typography.Link
                  onClick={() => {
                    const collect = collectEventTableAction('修改项目信息');
                    renderReactNode(
                      <ProjectModal
                        data={{ name, description, cover, industry }}
                        onCancel={() => {
                          renderReactNode(null);
                          collect('cancel');
                        }}
                        onFinish={partial => {
                          renderReactNode(null);
                          if (Object.keys(partial).length) {
                            onUpdateProject('正在修改项目信息', async () => {
                              try {
                                await http.post('project/update', { id, userId: editor, teamId, ...partial });
                                message.success('修改项目信息成功');
                                collect('okay');
                                return { id, ...partial };
                              } catch (error) {
                                collect('error');
                                throw error;
                              }
                            });
                          } else {
                            collect('cancel');
                          }
                        }}
                      />
                    );
                  }}
                >
                  <EditOutlined />
                </Typography.Link>
              </Tooltip>
            </>
          )}
        </div>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: 'repeat(2, min-content)',
            gridTemplateRows: 'auto',
            paddingTop: 6,
            rowGap: 6,
          })}
        >
          <Tag
            color="processing"
            className={className}
            children={typeOfPlayMap[typeOfPlay]}
            onClick={() => {
              onQueryProject({ typeOfPlay: String(typeOfPlay) });
            }}
          />
          <div>
            <Typography.Text type="secondary">项目</Typography.Text>
            <Typography.Link
              onClick={() => {
                onQueryProject({ id: String(id) });
              }}
            >
              {id}
            </Typography.Link>
          </div>
          <Tag
            color="success"
            className={className}
            children={categoryMap[category]}
            onClick={() => {
              onQueryProject({ category: String(category) });
            }}
          />
          <div>
            <Typography.Text type="secondary">模板</Typography.Text>
            <Typography.Link
              onClick={() => {
                onQueryProject({ templateId: String(templateId) });
              }}
            >
              {templateId}
            </Typography.Link>
          </div>
        </div>
      </div>
    );
  },
});
