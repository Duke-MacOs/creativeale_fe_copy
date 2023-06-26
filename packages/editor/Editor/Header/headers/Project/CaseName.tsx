import { useState, memo, useEffect } from 'react';
import { Input, Button, Tooltip, Tag, Dropdown, Menu, theme } from 'antd';
import { useSelector, useStore } from 'react-redux';
import { Edit } from '@icon-park/react';
import Icon from '@ant-design/icons';
import { changeProps, useSettings } from '../../../../aStore';
import { classnest } from '../../../../utils';
import { ReactComponent as IconCloud } from './icon_cloud.svg';
import className from '../../style';
import { fetchProject, updateProject } from '@shared/api/project';
import { useHasFeature } from '@shared/userInfo';
import { useEventBus } from '@byted/hooks';

export const typeOfPlayMap: Record<number, any> = {
  // 默认
  0: '互动落地页',
  // 已废弃
  1: undefined,
  2: '轻互动',
  3: '直出互动',
  4: '互动视频',
  5: 'VR看房',
  6: 'VR视频',
  7: '3D看车',
};

const CaseName = ({ disabled = false, readOnly = false }: { disabled?: boolean; readOnly?: boolean }) => {
  const { dispatch, getState } = useStore<EditorState>();
  const isSuperAdmin = useSelector(({ userinfo }: EditorState) => (userinfo?.roles ?? 0 & 3) > 0); // 0b11
  const initialName = useSelector(({ project }: EditorState) => project.name);
  const [saveStatus, setSaveStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [caseName, setCaseName] = useState('');
  const typeOfPlay = useSettings('typeOfPlay') || 0;
  const directPlayFeature = useHasFeature('<direct_play>');

  useEventBus('SaveStatus', setSaveStatus);
  useEffect(() => {
    setCaseName(initialName);
    document.title = initialName || '万能编辑器';
  }, [initialName]);
  useEffect(() => {
    if (!isEditing && caseName !== initialName) {
      if (caseName.trim()) {
        dispatch(changeProps([0], { name: caseName.trim() }));
      } else {
        setCaseName(initialName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);
  const { token } = theme.useToken();

  const typeTag = <Tag color={token.colorPrimary}>{typeOfPlayMap[typeOfPlay]}</Tag>;
  return (
    <div className={classnest({ [`${className}-content`]: 2 })}>
      <div>
        {readOnly && (
          <Tooltip title="只读模式下所有项目改动仅为本地暂存，若需同步线上，请另存版本" placement="bottom">
            <Tag
              color={token.colorPrimary}
              onClick={() => {
                if (isSuperAdmin) {
                  const url = new URL(location.href);
                  url.searchParams.set('readonly', '0');
                  location.href = url.href;
                }
              }}
            >
              {isSuperAdmin ? '只读，申请编辑' : '只读'}
            </Tag>
          </Tooltip>
        )}
        {!readOnly &&
          ([0, 3].includes(typeOfPlay) && directPlayFeature ? (
            <Dropdown
              overlay={
                <Menu
                  onClick={async () => {
                    const {
                      project: {
                        id,
                        settings: { typeOfPlay },
                      },
                    } = getState();
                    const { projectContent } = await fetchProject(id);
                    const content = JSON.parse(projectContent);

                    await updateProject({
                      id,
                      typeOfPlay: typeOfPlay === 0 ? 3 : 0,
                      projectContent: JSON.stringify({
                        ...content,
                        sceneOrders: content.sceneOrders.map((id: number) => {
                          if (typeOfPlay === 0) {
                            return id === content.settings.loading ? content.settings.playable : id;
                          } else if (typeOfPlay === 3) {
                            return id === content.settings.playable ? content.settings.loading : id;
                          }
                          return id;
                        }),
                        settings: { ...content.settings, typeOfPlay: typeOfPlay === 0 ? 3 : 0 },
                      }),
                    });
                    location.reload();
                  }}
                >
                  {typeOfPlay === 0 && <Menu.Item key="0">转化为直出互动</Menu.Item>}
                  {typeOfPlay === 3 && <Menu.Item key="3">转化为互动落地页</Menu.Item>}
                </Menu>
              }
            >
              {typeTag}
            </Dropdown>
          ) : (
            typeTag
          ))}
        {isEditing ? (
          <Input
            className={`${className}-input`}
            value={caseName}
            autoFocus={true}
            maxLength={20}
            onChange={({ target: { value } }) => setCaseName(value)}
            onBlur={() => {
              setIsEditing(false);
            }}
            onPressEnter={() => {
              setIsEditing(false);
            }}
          />
        ) : (
          <p style={{ margin: '0' }}>{caseName}</p>
        )}
        {!disabled && (
          <Tooltip title="编辑项目名称" placement="bottom">
            <Button
              type="text"
              size={'small'}
              style={{ display: isEditing ? 'none' : 'block', border: 'none', boxShadow: 'none' }}
              icon={<Icon component={Edit as any} className={`${className}-edit`} />}
              onClick={() => {
                setIsEditing(true);
              }}
            />
          </Tooltip>
        )}
      </div>
      {!readOnly && (
        <div style={{ color: '#CDCFD9' }}>
          <IconCloud />
          {saveStatus}
        </div>
      )}
    </div>
  );
};
export default memo(CaseName);
