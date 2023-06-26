import { ICaseState, ICustomScriptState, INodeState, ISceneState } from '@editor/aStore';
import { createScene, updateScene } from '@shared/api/project';
import { createResource, uploadDataUri } from '@shared/api';
import {
  getCustomScriptByOrderId,
  getSceneByOrderId,
  getNodesByStateId,
  updateSceneId,
  intoScene,
  newID,
  fromScene,
} from '@editor/utils';
import { ResourceType } from '@editor/Resource/upload/accepted';
import JSZip from 'jszip';
import { compilerTSCode } from '@editor/Editor/Blueprint/utils';
import { captureNode3DData, INodeData } from '@byted/riko';
import { syncGetCustomScriptDeps } from '@editor/Editor/Blueprint/utils/getCustomScriptDeps';

const getNodesMaxDuration = (nodes: INodeState[] = [], max = 0): number => {
  return nodes.reduce((max, { nodes, scripts }) => {
    return getNodesMaxDuration(
      nodes,
      Math.max(
        max,
        ...scripts.map(({ type, time = 0, duration = 0 }) => {
          switch (type) {
            case 'Controller':
            case 'Effect':
              return time + duration;
            case 'Script':
              return time;
            default:
              return 0;
          }
        })
      )
    );
  }, max);
};

const isSavedScene = (project: EditorState['project'], scene: ISceneState) => {
  while (project.editor.prevState) {
    project = project.editor.prevState;
  }
  return project.scenes.some(({ sceneId }) => sceneId === scene.sceneId);
};

export const createComp = async (
  project: EditorState['project'],
  scene: ISceneState,
  saveAs = false
): Promise<ISceneState> => {
  if (saveAs || !isSavedScene(project, scene)) {
    // NOTE: 另存为必须重置 sceneId
    scene = { ...scene, sceneId: 0 };
  }
  scene.props[scene.id].duration = getNodesMaxDuration(scene.nodes);
  scene.editor.state?.forEach(state => {
    state.duration = getNodesMaxDuration(getNodesByStateId(scene, state.id));
  });

  if (!scene.sceneId) {
    if (project.editor.readOnly) {
      const id = newID();
      return updateSceneId(scene, id, id);
    }
    const { id, orderId } = await createScene({
      projectId: project.id,
      name: scene.name,
      sceneContent: JSON.stringify(intoScene(scene)),
    });
    return updateSceneId(scene, id, orderId);
  } else {
    if (!project.editor.readOnly) {
      await updateScene({
        name: scene.name || 'Scene',
        id: scene.sceneId,
        projectId: project.id,
        sceneContent: JSON.stringify(intoScene(scene)),
      });
    }
    return scene;
  }
};

export const publishComp = async (
  project: EditorState['project'],
  component: ISceneState,
  params?: Record<string, any>
): Promise<void> => {
  const [oldScenes, oldCustomScripts] = [[], []] as [INodeData[], ICustomScriptState[]];
  const expandScripts = async (scripts: RikoScript[] = []): Promise<RikoScript[] | undefined> => {
    const children = scripts.map(async script => {
      const { url, ...props } = script.props;
      const { script: type, scripts, elseScripts } = props;
      if (type === 'Conditions' && Array.isArray(elseScripts) && elseScripts?.length) {
        const [s, elseScripts] = await Promise.all([await expandScripts(scripts), await expandScripts(scripts)]);
        return {
          ...script,
          props: {
            ...props,
            scripts: s,
            elseScripts,
          },
        };
      }
      if (type === 'CloneComponent' && typeof url === 'number') {
        const [u, s] = await Promise.all([
          (await expandNodes([intoScene(getSceneByOrderId(project, url))]))![0],
          await expandScripts(scripts as any),
        ]);
        return {
          ...script,
          props: {
            ...props,
            url: u,
            scripts: s,
          },
        };
      }
      if (type === 'CustomScript' && typeof url === 'number') {
        const customScript = getCustomScriptByOrderId(project, url);
        collectCustomScript(customScript, project);
        const [jsCode, s] = await Promise.all([
          compilerTSCode(customScript, project.customScripts),
          expandScripts(scripts),
        ]);
        return {
          ...script,
          props: {
            ...props,
            jsCode,
            tsCode: customScript.ideCode, // 公共组件保存源码，项目导出时再提出
            scripts: s,
          },
        };
      }
      return {
        ...script,
        props: {
          ...script.props,
          scripts: await expandScripts(scripts),
        },
      };
    });
    return children.length ? await Promise.all(children) : undefined;

    function collectCustomScript(customScript: ICustomScriptState, project: ICaseState): void {
      oldCustomScripts.push(customScript);
      syncGetCustomScriptDeps(customScript.ideCode, project.customScripts, script => {
        collectCustomScript(script, project);
      });
    }
  };
  const expandNodes = async (nodes: RikoNode[] = []): Promise<RikoNode[] | undefined> => {
    const children = nodes.map(async node => {
      const { type, props: { url, ...props } = {}, nodes, scripts } = node;
      if (['Animation', 'Animation3D', 'Model', 'Particle3D'].includes(type) && typeof url === 'number') {
        const component = intoScene(getSceneByOrderId(project, url));

        oldScenes.push(component);
        const [expanded] = (await expandNodes([
          {
            ...component,
            nodes: (component.nodes || []).concat(nodes || []),
            scripts: (component.scripts || []).concat(scripts || []),
          },
        ]))!;
        return {
          ...node,
          props,
          scripts: expanded.scripts,
          nodes: expanded.nodes,
        };
      }

      const [s, n] = await Promise.all([expandScripts(scripts), expandNodes(nodes)]);
      return { ...node, scripts: s, nodes: n };
    });
    return children.length ? await Promise.all(children) : undefined;
  };

  const currentScene = intoScene(component);
  console.log('currentScene:', component, currentScene);

  // 如果是 3D 类型重新获取封面
  if (['Animation3D', 'Model', 'Particle3D'].includes(component.type)) {
    component.editor.capture = await captureNode3DData(currentScene);
  }
  oldScenes.push(currentScene);
  const [data] = (await expandNodes([currentScene]))!;
  const { name, platformTags, cover, description, isAuthControl, extra } = params ?? {};
  const previewUrl = cover
    ? cover.startsWith('data')
      ? (await uploadDataUri(cover || '', 'cover.png')).previewUrl
      : cover
    : (await uploadDataUri(component.editor.capture || '', 'cover.png')).previewUrl;
  const zip = new JSZip();
  zip.file('data.json', JSON.stringify(data));
  zip.file('source.json', JSON.stringify({ scenes: oldScenes, customScripts: oldCustomScripts }));
  const blob = await zip.generateAsync({ type: 'blob' });
  await createResource({
    name: name || component.name,
    file: new File([blob], 'bundle-publish.zip', { type: 'application/zip' }),
    cover: previewUrl,
    onPlatform: true,
    type: ResourceType[data.type as keyof typeof ResourceType] ?? 4,
    description,
    platformTags,
    isAuthControl: isAuthControl ?? false,
    teamId: project.teamId,
    extra,
  });
};
