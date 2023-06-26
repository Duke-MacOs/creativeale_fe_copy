import { updateComponent } from '@editor/aStore/selectors/useClipboard/utils';
import { fromScene, intoScene } from '@editor/utils';
import { fetchCompResource } from '@shared/api/library';
import { absoluteUrl } from '@shared/utils';
import Axios from 'axios';

export default async (state: EditorState['project']) => {
  const { createScenes, copyNode } = updateComponent(
    state,
    false,
    false,
    (_, url): url is string => {
      return typeof url === 'string' && (url.includes('payload=') || url.startsWith('material/private'));
    },
    async url => {
      const { data } = await Axios.get(absoluteUrl(url));
      return [url, fromScene(data)];
    },
    async url => {
      if (url) {
        const { searchParams } = new URL(absoluteUrl(url));
        const { name } = await fetchCompResource(searchParams.get('payload') || '', 25).catch(() => ({
          name: '未知脚本',
        }));
        const { data } = await Axios.get(url);

        const script = {
          ...data,
          ideCode: data.ideCode ? data.ideCode : data.language === 'typescript' ? data.tsCode : data.jsCode,
          type: 'CustomScript' as const,
          name,
        };
        return [url, script];
      }
      throw new Error();
    }
  );
  const scenes = await Promise.all(
    state.scenes.map(async scene => {
      const newScene = intoScene(scene);
      return fromScene({ ...newScene, nodes: await copyNode(newScene.nodes) });
    })
  );
  const { components, customScripts } = await createScenes();
  return {
    ...state,
    scenes: [...components, ...scenes],
    customScripts: [...customScripts, ...state.customScripts],
  };
};
