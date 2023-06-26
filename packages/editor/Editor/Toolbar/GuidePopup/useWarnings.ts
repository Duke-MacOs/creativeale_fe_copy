import { useEffect, useRef, useState } from 'react';
import { debounce, differenceBy } from 'lodash';
import { checkSceneWarnings } from '@editor/aStore';
import { getScene } from '@editor/utils';
import { useStore } from 'react-redux';
import { message } from 'antd';
import { toColorful } from '@shared/utils';

export default () => {
  const { subscribe, getState } = useStore<EditorState, EditorAction>();
  const [results, setResults] = useState([] as any[]);
  const prevSceneId = useRef(0);
  useEffect(() => {
    return subscribe(
      debounce(() => {
        const { project } = getState();
        const results = Array.from(checkSceneWarnings(getScene(project)));
        if (project.editor.selectedSceneId === prevSceneId.current) {
          setResults((oldResults: typeof results) => {
            for (const { message: element } of differenceBy(results, oldResults, ({ type }) => type)) {
              message.warning(element);
            }
            return results;
          });
        } else {
          prevSceneId.current = project.editor.selectedSceneId;
          setResults(results);
        }
      }, 1000)
    );
  }, [subscribe, getState]);
  return results.map(({ warning }, index) => ({ items: [toColorful(`${index + 1}. `, warning)] }));
};
