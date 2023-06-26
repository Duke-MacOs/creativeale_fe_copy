import { ICompProp, ISceneState } from '../../aStore';
import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { collectIndices, Spark } from '@editor/Editor/Property/cells';
import * as sparks from '../../Editor/Property/spark/layouts';
import { mapResNode } from '../rikoHooks';
import { intoScene } from '../intoFrom';
import { isAnimation, newID } from '..';
import { uniq } from 'lodash';

const collectKeys = (spark?: Spark, required = true) =>
  spark ? (collectIndices(spark, [required ? 'required' : 'recommended']) as string[]) : [];

// openKeys 转 compProps
export const openKeysToCompProps = (scene: ISceneState) => {
  const { nodes, ...rest } = intoScene(scene);
  return {
    ...scene,
    props: {
      ...scene.props,
      [scene.id]: {
        ...scene.props[scene.id],
        // 当 scene.type === 'Scene'     时，场景 enabled 的默认值为  true
        // 当 scene.type === 'Animation' 时，场景 enabled 的默认值为 false
        compProps: Array.from(fromNodes((nodes || []).concat(rest), scene.type === 'Scene')).filter(
          ({ props, type }) => props.length || isAnimation(type)
        ),
      },
    },
  };
};

function* fromNodes(nodes: RikoNode[] = [], enabledDefault: boolean): Generator<ICompProp> {
  for (const { id, type, editor = {}, props, scripts, nodes: children } of nodes) {
    const {
      enabled = enabledDefault,
      openKeys = collectKeys(
        sparks[type as keyof typeof sparks](
          { type: type as any, id: 0 },
          { propsMode: 'Project', isRoot: false, rootType: 'Scene' }
        ),
        false
      ),
    } = editor;
    if (enabled) {
      yield {
        ids: [id],
        type,
        name: (props?.name as string) || type,
        props: uniq(
          collectKeys(
            sparks[type as keyof typeof sparks](
              { type: type as any, id: 0 },
              { propsMode: 'Project', isRoot: false, rootType: 'Scene' }
            )
          ).concat(openKeys)
        ).map(key => ({
          key,
          default: props?.[key],
        })),
      };
    }
    // 根脚本 enabled 的默认值跟随根场景的 enabled
    yield* fromScripts(props?.name as string, scripts, enabledDefault);
    if (isAnimation(type)) {
      // compProps enabled 的默认值跟随根场景的 enabled
      yield* fromCompProps(id, props?.compProps as any, enabledDefault, enabled);
    }
    // 节点 enabled 的默认值跟随根场景的 enabled
    yield* fromNodes(children, enabledDefault);
  }
}

function* fromScripts(parentName = '', scripts: RikoScript[] = [], enabledDefault: boolean): Generator<ICompProp> {
  for (const { id, props, type: scriptType, editor = {} } of scripts) {
    if (props.script === 'Conditions') {
      yield* fromScripts(parentName, props.scripts, enabledDefault);
      yield* fromScripts(parentName, props.elseScripts, enabledDefault);
      continue;
    }
    const { enabled = scriptType === 'Blueprint' || enabledDefault, openKeys } = editor;
    if (enabled) {
      const name = `${parentName}${props.name}`;
      const type = `${scriptType}_${props.script}`;
      if (scriptType !== 'Blueprint') {
        yield {
          ids: [id],
          type,
          name:
            props.script === 'CustomScript' &&
            ((props as any)?._editor?.name || (props as any)?._editor?.bpName || props?._resName)
              ? ((props as any)?._editor?.name || (props as any)?._editor?.bpName || props?._resName).replace(
                  /\.(ts|js)$/g,
                  ''
                )
              : name,
          props: uniq(
            collectKeys(
              EVENTS[(scriptType === 'Script' ? props.script : 'Effect') as keyof typeof EVENTS]?.content
            ).concat(
              openKeys ??
                collectKeys(
                  EVENTS[(scriptType === 'Script' ? props.script : 'Effect') as keyof typeof EVENTS]?.content,
                  false
                )
            )
          )
            .filter(key => !key.startsWith('$') || props[key]) // 清除不存在的key
            .map(key => {
              const value_ = props?.[key] as any;
              const value =
                key.startsWith('$') && value_ ? mapResNode(value_, node => ({ ...node, id: newID() })) : value_;
              return { key, default: value, value };
            }),
        };
      }
      // 子脚本enabled的默认值跟随根脚本的enabled
      yield* fromScripts(name, props.scripts, enabled);
    }
  }
}

function* fromCompProps(id: number, compProps: ICompProp[] = [], enabledDefault: boolean, nodeEnabled: boolean) {
  for (const { enabled = enabledDefault, ids, type, name, props } of compProps) {
    if (type.startsWith('Script_') ? nodeEnabled : enabled) {
      yield {
        ids: [id, ...ids],
        type,
        name,
        props: props
          .filter(({ enabled = enabledDefault, key }) => enabled && !key.startsWith('_'))
          .map(({ value, default: d, key }) => ({ key, default: value ?? d })),
      };
    }
  }
}
