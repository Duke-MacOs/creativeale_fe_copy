import { useState } from 'react';
import { Layout, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { css } from 'emotion';
import { Config, DocDetail, FolderCode, Search } from '@icon-park/react';
import { classnest } from '@editor/utils';
import { IdeState } from '@webIde/index';
import { updateSetting } from '@webIde/store';
import useCreateTab from './hooks/useCreateTab';
import logoImage from './logoImage.svg';
import { CreateTabModal } from './CreateTabModal';
import { ResourceList } from './ResourceList';
import { GlobalSearch } from './GlobalSearch';
import render from '@editor/Editor/Property/cells';
import { amIHere } from '@shared/utils';

const styles = {
  sider: css({
    backgroundColor: '#1e1f1c',
    overflow: 'auto',

    '& .ant-layout-sider-children': {
      display: 'flex',
      flexDirection: 'column',
    },
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
  header: css({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 12px 12px 16px',
    backgroundColor: 'black',
    zIndex: 1,
  }),
  headerTitle: css({
    paddingLeft: '8px',
    color: '#fff',
    verticalAlign: 'middle',
    fontWeight: 'bold',
  }),
  main: css({
    position: 'relative',
    flex: 1,
    height: 0,
  }),
  mainCon: css({
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: 'flex',
  }),
  mainLeft: css({
    flex: '0 0 50px',
    backgroundColor: 'black',
  }),
  mainRight: css({
    flex: 1,
    width: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#555',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
  }),
  navItem: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50px',
    cursor: 'pointer',
    color: '#929292',
    '&:hover': {
      color: '#fff',
    },
  }),
  navItemActive: css({
    position: 'relative',
    color: '#fff',
  }),
  footer: css({
    height: '50px',
    borderTop: '1px solid #333',
    backgroundColor: '#111',
    lineHeight: '50px',
    textAlign: 'center',
    color: '#fff',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#3955f6',
    },
  }),
  settingWrapper: css({
    '& .editor-property-grid-wrapper': {
      marginLeft: '6px',
      marginRight: '6px',
    },
    '& .editor-property .ant-collapse .ant-collapse-item .ant-collapse-header': {
      paddingTop: '12px',
      color: '#fff',
    },
    '& .editor-property .ant-collapse .ant-collapse-item': {
      borderTop: 0,
    },
  }),
};

export default function Sidebar() {
  const { setting, resourceNav, projectId, readOnly } = useSelector((state: IdeState) => {
    const { setting, workspace, tabs } = state.ide;
    return {
      setting,
      projectId: workspace.projectId,
      readOnly: workspace.readOnly,
      resourceNav: workspace.resourceNav.map(id => tabs[id]),
    };
  }, shallowEqual);
  const dispatch = useDispatch();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeNav, setActiveNav] = useState('files');
  const onCreate = useCreateTab();

  const { fontSize, theme } = setting;

  return (
    <Layout.Sider
      className={styles.sider}
      style={{ filter: theme === 'Light' ? 'invert(1) hue-rotate(180deg)' : 'unset' }}
      width={320}
      onContextMenu={e => e.preventDefault()}
    >
      <div className={styles.header}>
        <img src={logoImage} />
        <span className={styles.headerTitle}>万能互动 IDE</span>
      </div>
      <div className={styles.main}>
        <div className={styles.mainCon}>
          <div className={styles.mainLeft}>
            <Tooltip title="资源管理器" placement="right">
              <div
                className={classnest({
                  [styles.navItem]: 1,
                  [styles.navItemActive]: activeNav === 'files',
                })}
                onClick={() => setActiveNav('files')}
              >
                <FolderCode theme="outline" size="22" style={{ lineHeight: '11px' }} />
              </div>
            </Tooltip>
            <Tooltip title="搜索" placement="right">
              <div
                className={classnest({
                  [styles.navItem]: 1,
                  [styles.navItemActive]: activeNav === 'search',
                })}
                onClick={() => setActiveNav('search')}
              >
                <Search theme="outline" size="22" style={{ lineHeight: '11px' }} />
              </div>
            </Tooltip>
            <Tooltip title="Api文档" placement="right">
              <div
                className={styles.navItem}
                onClick={() =>
                  window.open(
                    amIHere({ release: true })
                      ? 'https://riko.bytedance.com'
                      : ['https://riko.', 'web.', 'bytedance.', 'net'].join('')
                  )
                }
              >
                <DocDetail theme="outline" size="22" style={{ lineHeight: '11px' }} />
              </div>
            </Tooltip>
            <Tooltip title="设置" placement="right">
              <div
                className={classnest({
                  [styles.navItem]: 1,
                  [styles.navItemActive]: activeNav === 'setting',
                })}
                onClick={() => setActiveNav('setting')}
              >
                <Config theme="outline" size="22" style={{ lineHeight: '11px' }} />
              </div>
            </Tooltip>
          </div>
          <div className={styles.mainRight}>
            <ResourceList visible={activeNav === 'files'} data={resourceNav} />
            <GlobalSearch visible={activeNav === 'search'} />
            {activeNav === 'setting' && (
              <div className={styles.settingWrapper}>
                {render({
                  spark: 'grid',
                  content: [
                    {
                      spark: 'element',
                      content(render) {
                        return render({
                          spark: 'select',
                          label: '字号',
                          value: fontSize as number,
                          options: [
                            {
                              label: '12',
                              value: 12,
                            },
                            {
                              label: '14',
                              value: 14,
                            },
                            {
                              label: '16',
                              value: 16,
                            },
                            {
                              label: '18',
                              value: 18,
                            },
                          ],
                          onChange(fontSize) {
                            dispatch(updateSetting({ fontSize }));
                          },
                        });
                      },
                    },
                    {
                      spark: 'element',
                      content(render) {
                        return render({
                          spark: 'select',
                          label: '主题',
                          value: theme as string,
                          options: [
                            { label: 'Dark', value: 'Dark' },
                            { label: 'Light', value: 'Light' },
                          ],
                          onChange(theme) {
                            dispatch(updateSetting({ theme }));
                          },
                        });
                      },
                    },
                  ],
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {projectId && !readOnly && (
        <div
          className={styles.footer}
          onClick={() => {
            setCreateModalVisible(true);
          }}
        >
          <PlusOutlined style={{ paddingRight: '6px' }} />
          新建脚本
        </div>
      )}
      {createModalVisible && (
        <CreateTabModal
          onConfirm={(name, language) => {
            return onCreate(name, language).then(() => {
              setCreateModalVisible(false);
            });
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      )}
    </Layout.Sider>
  );
}
