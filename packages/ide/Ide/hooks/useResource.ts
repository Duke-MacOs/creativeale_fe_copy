import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getSceneDetail } from '@shared/api/project';
import { ITabState, updateTabs, useTab } from '@webIde/store';
import { createModel, extraLib } from '../monacoUtils';

const defaultContent = `export default class Script extends Riko.Script {
    onAwake() {
      console.log(this.target);
      // TODO
    }
  }`;

export function loadModel(tab: ITabState) {
  const { id } = tab;
  return getSceneDetail(id).then(({ name, sceneContent }: any) => {
    const { language, ideCode, jsCode } = JSON.parse(sceneContent);
    // 兼容旧数据，tsCode已被废弃
    let content = ideCode;
    let needsSave = false;

    if (!content) {
      needsSave = true;
      content = defaultContent;
    } else if (!jsCode) {
      needsSave = true;
    }

    createModel(name, content, language);
    extraLib.add(name, content);

    return {
      ...tab,
      name,
      resourceLanguage: language,
      resourceContent: content,
      needsSave,
      saveStatus: 0 as const,
    };
  });
}

export function useResource(tabId: number | null) {
  const dispatch = useDispatch();
  const { tab } = useTab(tabId);
  const prevTabId = useRef(tabId);

  useEffect(() => {
    if (tabId && tab && prevTabId.current !== tabId) {
      prevTabId.current = tabId;

      loadModel(tab).then((tabWithContent: ITabState) => {
        dispatch(updateTabs({ [tabId]: tabWithContent }));
      });
    }
  }, [tabId, tab, dispatch]);
}
