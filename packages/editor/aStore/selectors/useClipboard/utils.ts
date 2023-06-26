import Axios from 'axios';
import { createEntry } from '@shared/globals/localStore';
import { ISceneState, ICustomScriptState } from '@editor/aStore';
import { getProjectState } from '@editor/Editor/Header/hooks/useRestore';
import { fromRikoHook, fromScene, intoRikoHook, intoScene, updateSceneId } from '@editor/utils';
import { ICompProp, IMaterialState, ITexture2D } from '@editor/aStore/project';
import { fetchCompResource } from '@shared/api/library';
import { omit, pickBy, memoize } from 'lodash';
import { createScenes } from '@shared/api/project';
import { absoluteUrl } from '@shared/utils';
import { asyncGetCustomScriptDeps } from '@editor/Editor/Blueprint/utils/getCustomScriptDeps';

export type EditorClipboard = {
  projectId: number;
  userId?: string | number;
  position?: { x: number; y: number };
  scripts?: RikoScript[];
  events?: RikoScript[];
  nodes?: RikoNode[];
  [id: number]: EditorClipboard;
};

export const clipboard = createEntry(
  'editor.clipboard',
  value => {
    try {
      return JSON.parse(value as string) as EditorClipboard;
    } catch {
      return null;
    }
  },
  JSON.stringify,
  true
);

export const duplicateComponent = (
  project: EditorState['project'],
  oldProjectId: number,
  alwaysCreateNewScene = false
) => {
  const shouldSkipped = !alwaysCreateNewScene && oldProjectId === project.id;
  const oldProject = project.id === oldProjectId ? Promise.resolve(project) : getProjectState(oldProjectId);
  return updateComponent(
    project,
    shouldSkipped,
    false,
    (_, url): url is number | string => {
      return typeof url === 'number' || (typeof url === 'string' && url.includes('payload='));
    },
    async urlOrId => {
      const { scenes } = flatProject(await oldProject);
      if (typeof urlOrId === 'number') {
        const component = scenes.find(scene => scene.orderId === urlOrId);
        return [component?.sceneId, component];
      } else {
        const { data } = await Axios.get(urlOrId);
        const component = fromScene(data);
        return [urlOrId, component];
      }
    },
    async (urlOrId, name) => {
      const { customScripts } = flatProject(await oldProject);
      if (urlOrId === undefined && name) {
        const script = customScripts.find(script => script.name === name);
        return [script?.id, script];
      } else if (typeof urlOrId === 'number') {
        const script = customScripts.find(script => script.orderId === urlOrId);
        return [script?.id, script];
      } else {
        const { searchParams } = new URL(absoluteUrl(urlOrId!));
        const { name } = await fetchCompResource(searchParams.get('payload') || '', 25).catch(() => ({
          name: '未知脚本',
        }));
        const { data } = await Axios.get(urlOrId!);
        const script = {
          ...omit(data, 'tsCode'),
          ideCode: data.ideCode ? data.ideCode : data.language === 'typescript' ? data.tsCode : data.jsCode,
          type: 'CustomScript',
          name,
        };

        return [urlOrId, script as ICustomScriptState];
      }
    },
    {
      async getOldMaterial(urlOrId) {
        return typeof urlOrId === 'number' ? (await oldProject).materials.find(m => m.orderId === urlOrId) : urlOrId;
      },
      async getOldTexture2D(orderId) {
        return (await oldProject).texture2Ds.find(m => m.orderId === orderId);
      },
    },
    alwaysCreateNewScene
  );
};

const flatProject = ({
  editor,
  scenes,
  customScripts,
  cubemaps,
  materials,
  texture2Ds,
  panoramaDataList = [],
}: EditorState['project']): Pick<
  EditorState['project'],
  'scenes' | 'customScripts' | 'materials' | 'cubemaps' | 'texture2Ds' | 'panoramaDataList'
> => {
  if (editor.prevState) {
    const prev = flatProject(editor.prevState);
    return {
      customScripts: customScripts.concat(
        prev.customScripts.filter(
          ({ orderId }) => !customScripts.some(customScript => customScript.orderId === orderId)
        )
      ),
      scenes: scenes.concat(prev.scenes.filter(({ orderId }) => !scenes.some(scene => scene.orderId === orderId))),
      cubemaps: cubemaps.concat(
        prev.cubemaps.filter(({ orderId }) => !cubemaps.some(scene => scene.orderId === orderId))
      ),
      texture2Ds: texture2Ds.concat(
        prev.texture2Ds.filter(({ orderId }) => !texture2Ds.some(scene => scene.orderId === orderId))
      ),
      materials: materials.concat(
        prev.materials.filter(({ orderId }) => !materials.some(scene => scene.orderId === orderId))
      ),
      panoramaDataList: panoramaDataList.concat(
        prev.panoramaDataList?.filter(({ orderId }) => !panoramaDataList.some(scene => scene.orderId === orderId)) ?? []
      ),
    };
  }
  return {
    customScripts,
    scenes,
    cubemaps,
    materials,
    panoramaDataList,
    texture2Ds,
  };
};

export const updateComponent = <T extends number | string>(
  project: EditorState['project'],
  shouldSkipped: boolean,
  changeScene: boolean,
  targetUrl: (of: 'CustomScript' | 'Component', url: unknown) => url is T,
  getOldComponent: (urlOrId: T) => Promise<[T | undefined, ISceneState | undefined]>,
  getOldCustomScript: (urlOrId?: T, name?: string) => Promise<[T | undefined, ICustomScriptState | undefined]>,
  about3D: {
    getOldMaterial?: (urlOrId: T) => Promise<T extends number ? IMaterialState | undefined : string>;
    getOldTexture2D?: (orderId: number) => Promise<ITexture2D | undefined>;
  },
  alwaysCreateNewScene: boolean
) => {
  const getMemoOldComponent = memoize(getOldComponent);
  const getMemoOldCustom = memoize(getOldCustomScript);
  const {
    scenes: oldScenes,
    customScripts: oldScripts,
    cubemaps: oldCubemaps,
    texture2Ds: oldTexture2Ds,
    materials: oldMaterials,
    panoramaDataList: oldPanoramaDataList = [],
  } = flatProject(project);
  let nextOrderId = Math.max(
    ...oldScenes.map(({ orderId, id }) => (id === orderId ? 0 : orderId)),
    ...oldScripts.map(({ orderId, id }) => (id === orderId ? 0 : orderId)),
    ...oldCubemaps.map(({ orderId, id }) => (id === orderId ? 0 : orderId)),
    ...oldTexture2Ds.map(({ orderId, id }) => (id === orderId ? 0 : orderId)),
    ...oldMaterials.map(({ orderId, id }) => (id === orderId ? 0 : orderId)),
    ...oldPanoramaDataList.map(({ orderId, id }) => (id === orderId || !orderId ? 0 : orderId))
  );
  const customScripts = [] as ICustomScriptState[];
  const components = [] as ISceneState[];
  const materials = [] as IMaterialState[];
  const texture2Ds = [] as ITexture2D[];

  const getNewOrderId = async (orderId: T) => {
    try {
      const [parentId, oldComponent] = await getMemoOldComponent(orderId);
      const newComponent = oldScenes.concat(components).find(scene => scene.parentId === parentId);
      if (newComponent) {
        return newComponent.orderId;
      }
      if (!oldComponent) {
        throw new Error();
      }
      const index = components.push({
        ...oldComponent,
        parentId: alwaysCreateNewScene ? undefined : parentId,
        orderId: ++nextOrderId,
      });
      const component = intoScene(components[index - 1]);
      components[index - 1] = fromScene({
        ...component,
        nodes: await copyNode(component.nodes),
        scripts: await copyScript(component.scripts),
      });
      return components[index - 1].orderId;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  };

  const getNewScriptId = async (orderId: T) => {
    try {
      const [parentId, oldScript] = await getMemoOldCustom(orderId);
      const newScript = oldScripts.concat(customScripts).find(script => script.parentId === parentId);
      if (newScript) {
        return newScript.orderId;
      }
      if (!oldScript) {
        return new Error();
      }
      const script = { ...oldScript, parentId: alwaysCreateNewScene ? undefined : parentId, orderId: ++nextOrderId };
      customScripts.push(script);
      asyncGetCustomScriptDeps(script.ideCode, getOldCustomScript as any, ({ orderId }) => {
        getNewScriptId(orderId as T);
      });
      return script.orderId;
    } catch {
      return undefined;
    }
  };

  const copyProps = async <T extends Record<string, any>>(props: T): Promise<T> => {
    if (shouldSkipped) {
      return props;
    }
    return Object.fromEntries(
      await Promise.all(
        Object.entries(props || {}).map(async ([key, desc]) => {
          switch (desc.callee) {
            case 'Riko.useRes':
              if (desc.type === 'Component' && targetUrl('Component', desc.value)) {
                return [key, { ...desc, value: await getNewOrderId(desc.value) }];
              }
              return [key, desc];
            case 'Riko.useArray':
              const value = desc.value.map(async (value: any) => {
                const { v } = await copyProps({ v: intoRikoHook(desc.defaultItem, value) });
                return fromRikoHook(v);
              });
              return [key, { ...desc, value: await Promise.all(value) }];
            case 'Riko.useObject':
            case 'object':
              return [key, { ...desc, value: await copyProps(desc.value ?? desc.default) }];
            case 'Riko.useEvent':
              return [key, { ...desc, value: await copyScript(desc.value) }];
            default:
              return [key, desc];
          }
        })
      )
    );
  };

  const copyScript = async (scripts: RikoScript[] = []): Promise<RikoScript[]> => {
    if (shouldSkipped) {
      return scripts;
    }
    return Promise.all(
      scripts.map(async script => {
        if (
          changeScene &&
          script.props.script === 'ChangeScene' &&
          targetUrl('Component', script.props.sceneId as number)
        ) {
          return {
            ...script,
            props: {
              ...script.props,
              sceneId: await getNewOrderId(script.props.sceneId as T),
              scripts: script.props.scripts && (await copyScript(script.props.scripts as any)),
            },
          };
        }
        if (script.props.script === 'CustomScript') {
          const props = await copyProps(pickBy(script.props, (value, key) => key.startsWith('$') && value));
          return {
            ...script,
            props: {
              ...script.props,
              ...props,
              url: targetUrl('CustomScript', script.props.url)
                ? await getNewScriptId(script.props.url)
                : script.props.url,
              scripts: script.props.scripts && (await copyScript(script.props.scripts as any)),
            },
          };
        }
        if (script.props.script === 'CloneComponent' && targetUrl('Component', script.props.url)) {
          return {
            ...script,
            props: {
              ...script.props,
              url: await getNewOrderId(script.props.url),
              scripts: script.props.scripts && (await copyScript(script.props.scripts as any)),
            },
          };
        } else {
          return {
            ...script,
            props: {
              ...script.props,
              scripts: script.props.scripts && (await copyScript(script.props.scripts as any)),
            },
          };
        }
      })
    );
  };

  const copyNode = async (nodes: RikoNode[] = []): Promise<typeof nodes> => {
    if (shouldSkipped) {
      return nodes;
    }
    const getCompProps = async (compProps: ICompProp[] = []): Promise<ICompProp[]> => {
      return Promise.all(
        compProps.map(async compProp => {
          const props = compProp.props.filter(({ key, value }) => value && key.startsWith('$'));
          if (props.length) {
            const newProps = await copyProps(Object.fromEntries(props.map(({ key, value }) => [key, value])));
            return {
              ...compProp,
              props: compProp.props.map(prop => {
                if (newProps[prop.key]) {
                  return { ...prop, value: newProps[prop.key] };
                }
                return prop;
              }),
            };
          }
          return compProp;
        })
      );
    };
    const getUrl = async (url: T) => {
      if (targetUrl('Component', url)) {
        return getNewOrderId(url as T);
      }
      return url;
    };
    const getMaterial = async (urlOrId: T) => {
      if (shouldSkipped || !about3D?.getOldMaterial) {
        return urlOrId;
      }
      const material = await about3D.getOldMaterial(urlOrId);
      if (typeof material === 'string') return urlOrId;
      if (material) {
        material.orderId = ++nextOrderId;
        // 复制 xxxUrl 资源
        for (let i = 0, entries = Object.entries(material.material.props); i < entries.length; i++) {
          const [key, value] = entries[i];
          if (key.endsWith('Url') && typeof value === 'number') {
            const textureOrderId = await getTexture2D(value);
            material.material.props[key] = textureOrderId;
          }
        }
        materials.push(material);
        return material.orderId;
      }
      return '';
    };
    const getTexture2D = async (orderId: number) => {
      if (shouldSkipped || !about3D?.getOldTexture2D) {
        return;
      }
      const texture2D = await about3D.getOldTexture2D(orderId);
      if (texture2D) {
        texture2D.orderId = ++nextOrderId;
        texture2Ds.push(texture2D);
        return texture2D.orderId;
      }
    };
    return Promise.all(
      nodes.map(async node => {
        if (node.type === 'Animation' || node.type === 'Animation3D') {
          return {
            ...node,
            props: {
              ...node.props,
              compProps: await getCompProps(node.props?.compProps as any),
              url: await getUrl(node.props?.url as T),
            },
            scripts: await copyScript(node.scripts),
            nodes: await copyNode(node.nodes),
          };
        } else if (['Model', 'Particle3D'].includes(node.type)) {
          return {
            ...node,
            props: {
              ...node.props,
              url: await getUrl(node.props?.url as T),
            },
            scripts: await copyScript(node.scripts),
            nodes: await copyNode(node.nodes),
          };
        } else if (['ParticleSystem3D'].includes(node.type) || node.type.endsWith('MeshSprite3D')) {
          return {
            ...node,
            props: {
              ...node.props,
              ...(node.props?.materialUrls
                ? { materialUrls: await Promise.all((node.props.materialUrls as any[]).map(i => getMaterial(i))) }
                : {}),
            },
            scripts: await copyScript(node.scripts),
            nodes: await copyNode(node.nodes),
          };
        } else {
          return {
            ...node,
            scripts: await copyScript(node.scripts),
            nodes: await copyNode(node.nodes),
          };
        }
      })
    );
  };

  return {
    copyNode,
    copyScript,
    async createScenes() {
      if (project.editor.readOnly) {
        return {
          components,
          customScripts,
          materials,
          texture2Ds,
        };
      }
      const ids = await createScenes(
        project.id,
        [
          customScripts.map(item => ({ name: item.name, orderId: item.orderId, sceneContent: JSON.stringify(item) })),
          components.map(item => ({
            name: item.name,
            orderId: item.orderId,
            sceneContent: JSON.stringify(intoScene(item)),
          })),
          materials.map(item => ({
            name: item.name,
            orderId: item.orderId,
            sceneContent: JSON.stringify(item),
          })),
          texture2Ds.map(item => ({
            name: item.name,
            orderId: item.orderId,
            sceneContent: JSON.stringify(item.props),
          })),
        ].flat()
      );
      return {
        components: components.map(component => {
          const { id, orderId } = ids.find(({ orderId }) => orderId === component.orderId)!;
          return updateSceneId(component, id, orderId);
        }),
        customScripts: customScripts.map(customScript => ({
          ...customScript,
          id: ids.find(({ orderId }) => orderId === customScript.orderId)!.id,
        })),
        materials: materials.map(material => ({
          ...material,
          id: ids.find(({ orderId }) => orderId === material.orderId)!.id,
        })),
        texture2Ds: texture2Ds.map(texture2D => ({
          ...texture2D,
          id: ids.find(({ orderId }) => orderId === texture2D.orderId)!.id,
        })),
      };
    },
  };
};
