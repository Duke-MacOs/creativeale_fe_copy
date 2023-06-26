import { ICompProp, ISceneState, replaceAllNodes } from '@editor/aStore';
import { openKeysToCompProps } from './openKeysToCompProps';
import { isEqual, omit, pick } from 'lodash';
import { fromScripts, intoScene, isAnimation, isRikoHook, newID } from '..';
import { IScriptData } from '@byted/riko';
import { mergeRikoHook } from '@editor/Editor/Property/spark/layouts/Script/Event/eventGroups/CustomScript/CustomScriptUpload';

export const updateCompProps = (project: EditorState['project'], component: ISceneState) => {
  const { id, props } = openKeysToCompProps(component);
  const blueprint = intoScene(component).scripts?.find(script => script.type === 'Blueprint');
  return updateProject(
    project,
    component.orderId,
    props[id].compProps,
    [{ name: '默认状态', id: -1, duration: component.props[component.id].duration }, ...(component.editor.state ?? [])],
    blueprint && [
      {
        ...blueprint,
        props: { ...blueprint.props, scripts: [], inputs: [] as any }, // 每次都清空了inputs
        editor: { ...blueprint.editor, nodeType: 'node' },
      },
    ]
  );
};

/**
 * 更新互动组件实例的compProps、状态、蓝图
 * @param project
 * @param orderId
 * @param newComProps
 * @param state
 * @returns
 */
const updateProject = (
  project: EditorState['project'],
  orderId: number,
  newComProps: ICompProp[] = [],
  state: Array<{ name: string; id: number; duration?: number }>,
  blueprint: IScriptData[] = []
): typeof project => {
  const {
    editor: { prevState },
    scenes,
  } = project;
  return {
    ...project,
    editor: {
      ...project.editor,
      prevState: prevState && updateProject(prevState, orderId, newComProps, state, blueprint),
    },
    scenes: scenes.map(scene => {
      const props = Object.fromEntries(
        Object.entries(scene.props).map(([key, props]) => {
          if (!isAnimation(props.type) || props.url !== orderId) {
            return [key, props];
          }
          return [key, { ...props, compProps: mergeCompProps(newComProps, props.compProps) }];
        })
      );

      return {
        ...scene,
        props,
        nodes: replaceAllNodes(scene.nodes, node => {
          const { [node.id]: curProps } = scene.props;
          if (!isAnimation(curProps.type) || curProps.url !== orderId) {
            return node;
          }

          const blueprintScript = fromScripts(
            blueprint.map(script => ({ ...script, id: newID() })),
            props
          )[0];

          let scripts = node.scripts.map(script => {
            return script.type === 'Controller'
              ? {
                  ...script,
                  duration:
                    state.find(state => state.id === (Number(scene.props[script.id].stateId) || -1))?.duration ?? 0,
                }
              : script;
          });
          if (scripts.some(script => script.type === 'Blueprint')) {
            scripts = scripts.map(script => {
              return script.type === 'Blueprint'
                ? {
                    ...blueprintScript,
                    editor: { ...blueprintScript.editor, ...pick(script.editor, 'position') },
                    id: script.id,
                  }
                : script;
            });
          } else {
            scripts = [...scripts, blueprintScript].filter(Boolean);
          }

          return {
            ...node,
            editor: {
              ...omit(node.editor, 'visitIndices'),
              state,
            },
            scripts,
          };
        }),
      };
    }),
  };
};

export const mergeCompProps = (newComProps: ICompProp[] = [], oldComProps: ICompProp[] = []): ICompProp[] => {
  return newComProps
    .filter(({ enabled = true }) => enabled)
    .map(newCompProp => {
      const oldCompProp = oldComProps.find(({ ids }) => isEqual(ids, newCompProp.ids));
      return {
        ...newCompProp,
        props: newCompProp.props.map(prop => {
          const oldProp = oldCompProp?.props.find(({ key }) => key === prop.key);
          const newDefault = prop.value ?? prop.default;
          return {
            ...prop,
            default: newDefault,
            value:
              oldProp?.value && isRikoHook(oldProp.value) && isRikoHook(newDefault)
                ? mergeRikoHook(oldProp.value, newDefault)
                : oldProp?.value
                ? oldProp.value
                : newDefault,
          };
        }),
        state: oldCompProp?.state,
      };
    });
};
