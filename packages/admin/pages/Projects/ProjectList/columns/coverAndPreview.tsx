import type { GetProjectColumn } from '.';
import { ProjectStatus } from '../api';
import defaultImage from '@shared/assets/images/default_image.png';
import { collectEventTableAction } from '@main/collectEvent';
import { PlayCircleFilled } from '@ant-design/icons';
import { Tag } from 'antd';
import { css } from 'emotion';
import { http } from '@shared/api';

export const coverAndPreview: GetProjectColumn = ({ teamId, userId, onPreviewProject }) => ({
  title: '封面及预览',
  dataIndex: 'cover',
  key: 'coverAndPreview',
  align: 'center',
  width: '15%',
  render: (_, { id, cover, name, status, typeOfPlay }) => {
    return (
      <div
        style={{
          width: '64px',
          height: '100px',
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <img
          src={cover || defaultImage}
          alt={name}
          style={{
            position: 'absolute',
            background: '#eee',
            top: '0px',
            left: '0',
            width: '64px',
            height: '100px',
            borderRadius: '2px',
            objectFit: 'contain',
          }}
        />
        <PlayCircleFilled
          className={css({
            position: 'absolute',
            top: '0px',
            left: '0',
            width: '64px',
            height: '100px',
            fontSize: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: 0,
            ':hover': {
              opacity: 1,
            },
          })}
          onClick={() => {
            const collect = collectEventTableAction('生成预览链接');
            onPreviewProject('正在生成预览链接', async () => {
              try {
                const {
                  data: {
                    data: { previewUrl },
                  },
                } = await http.get('project/preview', { params: { teamId, userId, id, maxAge: 24 * 60 * 60 } });
                collect('okay');
                return { previewUrl, typeOfPlay };
              } catch (error) {
                collect('error');
                throw error;
              }
            });
          }}
        />
        {[ProjectStatus.Approved, ProjectStatus.ExampleApproved].includes(status) && (
          <Tag
            style={{
              padding: '0 4px',
              lineHeight: '18px',
              borderRadius: '2px',
              width: '35px',
              position: 'absolute',
              margin: 0,
              left: 0,
              top: 0,
            }}
            color="#3955f6"
          >
            公开
          </Tag>
        )}
      </div>
    );
  },
});
