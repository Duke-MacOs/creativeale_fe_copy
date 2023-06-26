/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getIndexer,
  collectIndices,
  IContext,
  Spark,
  updateIndices,
  mergeSpark,
  mergeOpenKeys,
  sameValue,
  Index,
  NULL_SPARK,
} from '../cells';
import {
  changeProps,
  groupActions,
  ICaseState,
  ICubemap,
  IProps,
  setOpenKeys as setOpenKeys_,
  updatePanoramaData,
} from '@editor/aStore';
import { findById, findEventById, getNodes, getPanoramaDataList, getScene, getSelectedIds } from '@editor/utils';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { useEffect, useState } from 'react';
import { ActionFlag } from '@byted/riko';
import * as spark from './layouts';
import * as panoramaEditSpark from './layouts/3D/PanoramaDataEdit';
import { isEqual } from 'lodash';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';

export { usePlayableSettings } from './layouts/usePlayable';
export { useGlobalSettings } from './layouts/useGlobal';

export function mergeStateToProps(stateId: number | undefined, props: IProps): IProps {
  const { state, ...rest } = props || {};

  if (stateId) {
    let newProps = { ...rest } as IProps;

    if (state && state[stateId]) {
      const partial = state[stateId];
      newProps = { ...newProps, ...partial } as IProps;
    }

    const { compProps } = newProps;
    if (compProps) {
      newProps.compProps = compProps.map(compProp => {
        const { props, state, ...rest } = compProp;
        if (state && state[stateId]) {
          const partial = state[stateId];
          return {
            ...rest,
            props: props.map(prop => {
              const { key, value } = prop;
              return {
                ...prop,
                value: partial[key] ?? value,
              };
            }),
          };
        }
        return compProp;
      });
    }
    return newProps;
  }

  return props;
}

export function fromProps(stateId: number | undefined, props: { [key: number]: IProps }) {
  return Object.fromEntries(
    Object.entries(props).map(([key, props]) => {
      return [key, mergeStateToProps(stateId, props)];
    })
  );
}

export const getUseValue = (
  currentIds: number[],
  { dispatch }: EditorStore,
  getCompProps = (key: Index, props: any) => props
): IContext['useValue'] => {
  return (index, isEqual) => {
    const { indexValue, indexEntries } = getIndexer(index);
    const value: any = useSelector(({ project }: EditorState) => {
      const {
        editor: { stateId },
        props: p,
      } = getScene(project);
      const props = fromProps(stateId, p);
      if (index === 'id') {
        return currentIds;
      }
      if (props[currentIds[0]]) {
        if (['Script', 'Effect', 'Controller'].includes(props[currentIds[0]].type)) {
          return [indexValue(props[currentIds[0]])];
        }
        if (index === 'compProps') {
          if (currentIds.length > 1 && sameValue(currentIds.map(id => props[id].url)) === undefined) {
            return currentIds.map(() => []);
          }
        }
        return currentIds.map(id => indexValue(getCompProps(index, props[id])));
      }
      // 作品模式时的子脚本
      const [event] = findEventById(props, currentIds[0]);
      return [indexValue(event?.props)];
    }, isEqual);
    return {
      value,
      onChange(value, { before, after, replace = false, ids = [] } = {}) {
        const options = {
          flag: before ? ActionFlag.Continuous : after ? ActionFlag.SideEffect : undefined,
          replace,
        };
        const actions = value.map((value, index) =>
          changeProps(
            [currentIds[index], ...ids],
            ids.length || replace ? value : Object.fromEntries(indexEntries(value)),
            options
          )
        );
        dispatch(actions.length === 1 ? actions[0] : groupActions(actions, options.flag));
      },
    };
  };
};

export const useGroup = (): Spark | undefined => {
  const store = useStore();
  const { ids, props, envs } = useSelector(({ project }: EditorState) => {
    const { ids, props, type: rootType, id: sceneId } = getCurrent(project);
    const { propsMode } = project.editor;
    while (project.editor.prevState) {
      project = project.editor.prevState;
    }
    const { scaleMode, typeOfPlay, category } = project.settings;
    const multiType = sameValue(ids.map(id => props[id].type)) === undefined;
    const multiple = ids.length > 1;
    return {
      ids,
      props: ids.map(id => {
        const { type } = props[id];
        return { id, type: type as Exclude<typeof type, ['Blueprint']>, multiple, multiType };
      }),
      envs: {
        propsMode,
        rootType,
        isRoot: ids[0] === sceneId && propsMode !== 'Product',
        scaleMode,
        typeOfPlay,
        category,
      },
    };
  }, isEqual);
  const content = props
    .map(props => spark[props.type as keyof typeof spark](props as any, envs))
    .reduce((spark1, spark2) => mergeSpark(spark1, spark2));
  const openKeys = useOpenKeys(content);
  const visiting = useVisiting(ids[0]);
  return {
    spark: 'context',
    content: { spark: 'visit', index: 0, label: '节点', content },
    provide: () => ({
      openKeys,
      visiting,
      useValue: getUseValue(ids, store),
    }),
  };
};

const changeCubemaps = (state: ICaseState, cubemaps: ICubemap[]): ICaseState => {
  return {
    ...state,
    editor: {
      ...state.editor,
      prevState: state.editor.prevState ? changeCubemaps(state.editor.prevState, cubemaps) : undefined,
    },
    cubemaps,
  };
};

export const getUsePanoramaEditValue = ({ dispatch, getState }: EditorStore): IContext['useValue'] => {
  return index => {
    const { indexValue, indexEntries } = getIndexer(index);
    const { value, id }: any = useSelector(({ project }: EditorState): any => {
      const panoramaEdit = project.editor.panoramaEdit;
      const panoramaData = getPanoramaDataList(project).find(i => i.orderId === panoramaEdit.panoramaDataOrderId);
      return { value: [indexValue(panoramaData ?? {})], id: panoramaData?.id };
    }, shallowEqual);
    return {
      value,
      onChange: async ([value]) => {
        dispatch(updatePanoramaData(id, Object.fromEntries(indexEntries(value))));
      },
    };
  };
};

export const usePanoramaEdit = (): Spark => {
  const useValue = getUsePanoramaEditValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  const { panorama, panoramaData, space, selected, propsMode } = useSelector(({ project }: EditorState): any => {
    const panoramaEdit = project.editor.panoramaEdit;
    const panoramaData = getPanoramaDataList(project).find(i => i.orderId === panoramaEdit.panoramaDataOrderId);
    const panorama = panoramaData?.panoramas.find(i => i.id === panoramaEdit.panoramaId);
    const space = panoramaData?.spaces.find(i => i.id === panoramaEdit.spaceId);
    let selected;
    if (panoramaEdit.type === 'panorama') selected = panorama;
    if (panoramaEdit.type === 'space') selected = space;
    return { panorama, panoramaData, space, selected, propsMode: project.editor.propsMode };
  }, shallowEqual);
  const type = selected?.type as keyof typeof panoramaEditSpark;
  const sparkFn =
    propsMode === 'Product'
      ? panoramaEditSpark[`${type}Product` as keyof typeof panoramaEditSpark] ?? panoramaEditSpark[type]
      : panoramaEditSpark[type];
  const content: Spark = sparkFn?.({ panorama, space, panoramaData }) ?? NULL_SPARK;
  return {
    spark: 'context',
    content: {
      spark: 'visit',
      index: 0,
      label: '全景编辑',
      content,
    },
    provide: () => {
      return {
        openKeys: {},
        useValue,
        visiting: {
          next,
          onVisit: setNext,
        },
      };
    },
  };
};

const useOpenKeys = (content: Spark): IContext['openKeys'] => {
  const { dispatch } = useStore();
  return useSelector(({ project }: EditorState) => {
    if (project.editor.propsMode !== 'Template') {
      return {};
    }
    const { ids, isScript, nodes, id: sceneId, type } = getCurrent(project);
    const currentIds = isScript ? ids.slice(0, 1) : ids;
    const items = currentIds.map(id => {
      const [node] = findById(nodes, id, isScript);
      const { openKeys, enabled = type === 'Scene' } = isScript
        ? node?.scripts.find(script => script.id === id)?.editor ?? {}
        : node?.editor ?? {};
      return { id, enabled: enabled && id !== sceneId, openKeys };
    });
    return {
      enabled: sameValue(items.map(({ enabled }) => enabled)) ?? false,
      checking: true,
      openKeys: items
        .map(({ openKeys }) => openKeys)
        .reduce((keys1 = [], keys2 = []) => mergeOpenKeys(keys1, keys2)) as any,
      setEnabled: (enabled: boolean, ids: number[] = []) => {
        dispatch(
          groupActions(
            currentIds.map(id =>
              setOpenKeys_([id, ...ids], {
                enabled,
              })
            )
          )
        );
      },
      setOpenKeys: (checked: boolean, slice: any[], ids: number[] = []) => {
        dispatch(
          groupActions(
            items.map(({ id, openKeys }) => {
              if (!ids.length) {
                slice = updateIndices(openKeys ?? collectIndices(content, ['required', 'recommended']), checked, slice);
              }
              return setOpenKeys_([id, ...ids], {
                openKeys: slice as string[],
              });
            })
          )
        );
      },
    };
  }, shallowEqual);
};

export const useVisiting = (id: number): IContext['visiting'] => {
  const [next, onVisit] = useState<Array<number | string> | undefined>(undefined);
  useEffect(() => {
    onVisit(undefined);
  }, [id]);
  return { next, onVisit };
};

export const getCurrent = (project: ICaseState) => {
  const {
    editor: { propsMode },
    settings: { typeOfPlay },
  } = project;
  const {
    editor: { edit3d },
  } = getScene(project);
  const scene = getScene(project);

  const { nodeIds, scriptIds } = getSelectedIds(scene.editor.selected);

  const ids =
    propsMode === 'Product'
      ? isVRCaseAndInEdit(project) && edit3d
        ? [scriptIds, nodeIds, [scene.id]].find(ids => ids.length)!
        : [scene.id]
      : typeOfPlay === 4
      ? [nodeIds, [scene.id]].find(ids => ids.length)!
      : [scriptIds, nodeIds, [scene.id]].find(ids => ids.length)!;
  return {
    ...scene,
    nodes: getNodes(scene),
    ids,
    isScript: ids === scriptIds,
  };
};
