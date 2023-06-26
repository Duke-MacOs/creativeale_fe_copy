import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { fetchProject } from '@shared/api/project';
import { IdeState } from '@webIde/index';
import { switchTab, updateTabs, updateWorkspace, ITabState, IWorkspaceState } from '@webIde/store';
import { amendTabName } from './compatibles';
import useEditorProxy from '@webIde/hooks/useEditorProxy';

export function useRestore() {
  const { orderId, projectId } = getQuery();
  const dispatch = useDispatch();
  const prevOrderId = useRef<IWorkspaceState['currentTab']>(null);
  const tabs = useSelector((state: IdeState) => state.ide.tabs);
  const { postMessage } = useEditorProxy();

  useEffect(() => {
    if (!projectId) {
      message.error('请从编辑器项目打开工作区');
      return;
    }

    fetchProject(projectId)
      .then(project => {
        const scriptList = project.scenes
          .filter(scene => {
            const content = JSON.parse(scene.sceneContent);
            return content.type === 'CustomScript' && content.status !== 1;
          })
          .map(scriptScene => {
            const { projectId, id, orderId, name, sceneContent } = scriptScene;
            const content = JSON.parse(sceneContent);
            return { ...content, id, orderId, projectId, name };
          });
        return amendTabName(scriptList);
      })
      .then(scriptList => {
        const tabList = scriptList.sort(() => -1).map(item => item.id);
        const tabs = scriptList.reduce((dict: Record<number, ITabState>, data) => {
          const { id, name, projectId, orderId, language } = data;
          dict[id] = {
            id,
            orderId,
            projectId,
            name,
            resourceLanguage: language,
            needsSave: false,
            saveStatus: 0,
          };
          return dict;
        }, {});
        dispatch(updateTabs(tabs));
        dispatch(updateWorkspace({ projectId, resourceNav: tabList }));

        return postMessage('initial', {});
      })
      .then(({ readOnly }: any) => {
        dispatch(updateWorkspace({ readOnly }));
      })
      .catch(e => {
        message.error('Ide初始化出错：' + e.message);
      });
  }, [projectId, dispatch, postMessage]);

  useEffect(() => {
    if (Number(orderId) !== prevOrderId.current && Object.keys(tabs).length > 0) {
      prevOrderId.current = Number(orderId);
      const tab = Object.values(tabs).find(tab => tab.orderId === Number(orderId));
      if (tab) {
        dispatch(switchTab(tab.id));
      }
    }
  }, [orderId, tabs, dispatch]);
}

const getQuery = () => {
  const params = new URLSearchParams(location.search);
  const orderId = String(params.get('tab')) || '0';
  const projectId = Number(params.get('project')) || 0;
  return { orderId, projectId };
};
