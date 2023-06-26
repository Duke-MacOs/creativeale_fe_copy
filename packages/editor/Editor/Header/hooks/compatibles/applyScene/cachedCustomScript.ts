import { IScriptData } from '@byted/riko';
import { isNil, omit } from 'lodash';
import { ISceneState } from '@editor/aStore';
import { getTab } from '@editor/utils';
import { http } from '@shared/api';

export default async ({ projectId, scene }: { projectId: number; scene: ISceneState }) => {
  const props = {} as ISceneState['props'];

  if (scene.type === 'Animation') {
    return scene;
  }

  for (const [id, prop] of Object.entries(scene.props)) {
    if (!Array.isArray(prop.scripts)) {
      props[Number(id)] = prop;
    } else {
      props[Number(id)] = {
        ...prop,
        scripts: await updateScripts(projectId, scene.sceneId, prop.scripts),
      };
    }
  }
  return { ...scene, props };
};

const updateScripts = async (projectId: number, sceneSid: number, scripts: any[]): Promise<any[]> => {
  return Promise.all(
    scripts.map(async (script: IScriptData) => {
      if (script.props.script === 'Conditions') {
        return {
          ...script,
          props: {
            ...script.props,
            scripts: await updateScripts(projectId, sceneSid, script.props.scripts as any[]),
          },
        };
      }
      if (script.props.script !== 'CustomScript' || isNil(script.props.jsCode)) {
        return script;
      }
      return {
        ...script,
        props: await updateProps(projectId, sceneSid, script.id, script.props),
      };
    })
  );
};

const updateProps = async (projectId: number, sceneSid: number, scriptId: number, props: Record<string, unknown>) => {
  const newProps = omit(props, 'jsCode');

  const tab = await getTab(`${sceneSid}_${scriptId}`);
  const language = tab?.language ?? 'javascript';
  const content = tab?.content ?? props.jsCode;
  const compiledContent = tab?.compiledContent;

  const data = {
    projectId,
    name: '脚本' + (language === 'typescript' ? '.ts' : '.js'),
    cover: '',
    isTeam: false,
    type: 25,
    content: JSON.stringify({
      ideCode: content,
      jsCode: language === 'typescript' ? compiledContent : content,
      language,
    }),
  };

  const result = await http.post('user/adv_resource/create', data);
  newProps['url'] = result.data.data.previewUrl;
  return newProps;
};
