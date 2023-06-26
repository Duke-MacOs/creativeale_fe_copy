import { BlueprintCategory, BlueprintTemplateNodes } from '@byted/riko';
import { SCRIPTS } from '@editor/Editor/Property/spark/layouts/Script/Scripts';
import { EVENTS } from '@editor/Editor/Property/spark/layouts/Script/Event';
import { sparkValue } from '@editor/Editor/Property/cells';
import { useEffect, useMemo, useState } from 'react';
import { IProps, useEditor, useSettings } from '@editor/aStore';
import { useSelector } from 'react-redux';
import { isEqual, isFunction, sortBy } from 'lodash';
import { fetchDynamicResources } from '../api';
import { useDebounceFn, useEventBus } from '@byted/hooks';
import { convertToPinyin } from 'tiny-pinyin';
import { useInUsedOrderIds } from '.';

// 同一个脚本modifyData需要变成三个图块独立使用：修改属性、修改场景变量、修改全局变量
const index = BlueprintTemplateNodes.findIndex(({ script }) => script === 'ModifyData');
let modifyProperty: (typeof BlueprintTemplateNodes)[number];
if (index > -1) {
  const ModifyData = BlueprintTemplateNodes[index];
  modifyProperty = { ...ModifyData, script: 'ModifyProperty', name: '修改属性', category: '通用' };
  BlueprintTemplateNodes.splice(index, 0, {
    ...ModifyData,
    name: '修改全局变量',
  });
}

// should be removed
BlueprintTemplateNodes.push({
  name: '启用3D物理',
  script: 'RigidBody3D',
  inputs: [
    {
      label: '启用',
      key: 'onEnter',
      tooltip: '启用3D物理',
    },
  ],
  outputs: [],
  category: '高级',
  contextType: 'both',
});

export enum ItemType {
  /**
   * 内置图块
   */
  Inherent,
  /**
   * 团队图块
   */
  Team,
  /**
   * 个人图块
   */
  Personal,
  /**
   * 项目图块
   */
  Project,
}
function typeAlias(type: keyof typeof ItemType): string {
  switch (type) {
    case 'Inherent': {
      return '内置图块';
    }
    case 'Team': {
      return '团队图块';
    }
    case 'Personal': {
      return '个人图块';
    }
    case 'Project': {
      return '项目图块';
    }
  }
}

type ItemList = Array<{
  type: ItemType.Inherent | ItemType.Team | ItemType.Personal | ItemType.Project;
  script: RikoScript;
  resourceId?: number;
  inUsed?: boolean;
}>;

/**
 * 蓝图模板节点
 * @returns
 */
export function useMenus() {
  const enabled3d = useSettings('enabled3d');
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const [reloadResource, setReloadResource] = useState(0);
  useEventBus('reloadResource', () => {
    setReloadResource(value => value + 1);
  });

  const inUsedOrderIds = useInUsedOrderIds();

  // 内置图块
  const nativeResources = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(
          BlueprintTemplateNodes?.reduce((menus, item) => {
            const { category, contextType } = item;

            if (!menus[category]) menus[category] = [];
            if ((contextType === '2d' && enabled3d) || (contextType === '3d' && !enabled3d)) return menus;
            menus[category].push(item);
            return menus;
          }, {} as Record<BlueprintCategory, typeof BlueprintTemplateNodes>)
        ).map(
          ([category, items]) =>
            [
              category,
              (category === '通用' ? [modifyProperty, ...items] : items).map(item => {
                const { name, script, inputs, outputs, code } = item;

                const scriptDesc = { ...SCRIPTS, ...EVENTS }[script];
                const props: IProps = {} as any;
                if (scriptDesc) {
                  const defaultProps = scriptDesc.content
                    ? sparkValue(isFunction(scriptDesc.content) ? scriptDesc.content({}) : scriptDesc.content)
                    : {};
                  const extraProps = scriptDesc.extraProps?.({ enableBlueprint }) || {};
                  Object.assign(props, defaultProps, extraProps);
                }
                if (item.name === '修改全局变量') {
                  props.expression = {
                    ...((props.expression as any) || {}),
                    from: {
                      type: 'store',
                    },
                  };
                }

                return {
                  type: ItemType['Inherent'],
                  script: {
                    id: 0,
                    type: script === 'Effect' ? 'Effect' : 'Script',
                    editor: {
                      inputs,
                      outputs,
                      nodeType: 'block',
                    },
                    props: {
                      ...props,
                      name,
                      script: script === 'Effect' ? 'AlphaTo' : script === 'ModifyProperty' ? 'ModifyData' : script,
                      tsCode: code,
                    },
                  } as RikoScript,
                };
              }),
            ] as const
        )
      ) as Record<BlueprintCategory, ItemList>,
    [enabled3d, enableBlueprint]
  );
  // 项目图块
  const customScripts = useCustomScripts();
  const projectResources: ItemList = useMemo(() => {
    return sortBy(
      customScripts
        .filter(script => script.status !== 1)
        .map(({ id, orderId, name }) => {
          return {
            type: ItemType['Project'],
            inUsed: inUsedOrderIds.includes(orderId),
            script: {
              id, // id最后会被更新，刚好用来承载脚本场景id方便读取
              type: 'Script',
              editor: {
                inputs: [],
                outputs: [],
                nodeType: 'block',
              },
              props: {
                script: 'CustomScript',
                name,
                url: orderId,
              },
            },
          };
        }),
      item => item.script.props.name
    );
  }, [customScripts, inUsedOrderIds]);
  // 个人图块
  const [personalResources, setPersonalResources] = useState<ItemList>([]);
  // 团队图块
  const [teamResources, setTeamResources] = useState<ItemList>([]);

  useEffect(() => {
    (async function () {
      const [{ list: p }, { list: t }] = await Promise.all([
        fetchDynamicResources({ type: 'code' }),
        fetchDynamicResources({ type: 'code', isTeam: true, excludeSelf: true }),
      ]);
      setPersonalResources(
        p.map(res => {
          const {
            id,
            name,
            data: { code: tsCode },
          } = res;
          return {
            type: ItemType.Personal,
            resourceId: id,
            script: {
              id: 0,
              type: 'Script',
              editor: {
                inputs: [],
                outputs: [],
                nodeType: 'block',
              },
              props: {
                script: 'CustomScript',
                name,
                tsCode,
              },
            },
          };
        })
      );
      setTeamResources(
        t.map(res => {
          const {
            id,
            name,
            data: { code: tsCode },
          } = res;
          return {
            type: ItemType['Team'],
            resourceId: id,
            script: {
              id: 0,
              type: 'Script',
              editor: {
                inputs: [],
                outputs: [],
                nodeType: 'block',
              },
              props: {
                script: 'CustomScript',
                name,
                tsCode,
              },
            },
          };
        })
      );
    })();
  }, [setPersonalResources, setTeamResources, reloadResource]);

  const defaultMenus = useMemo(() => {
    const record: Record<BlueprintCategory, ItemList> = Object.assign(
      {},
      {
        [typeAlias(ItemType[ItemType.Project] as keyof typeof ItemType)]: projectResources,
      },
      nativeResources,
      {
        [typeAlias(ItemType[ItemType.Team] as keyof typeof ItemType)]: teamResources,
      },
      {
        [typeAlias(ItemType[ItemType.Personal] as keyof typeof ItemType)]: personalResources,
      }
    );
    return Object.fromEntries(Object.entries(record).filter(([_, scripts]) => scripts.length > 0));
  }, [nativeResources, personalResources, projectResources, teamResources]);

  const [menus, setMenus] = useState(defaultMenus);
  const [search, setSearch] = useState('');
  const { run, cancel } = useDebounceFn((search: string, defaultMenus: { [k: string]: ItemList }) => {
    if (!search) {
      setMenus(defaultMenus);
    } else {
      setMenus(
        Object.fromEntries(
          Object.entries(defaultMenus)
            .map(([category, items]) => {
              return [
                category,
                items.filter(
                  ({ script }) =>
                    script.props.name?.includes(search) ||
                    convertToPinyin(script.props.name!).toLowerCase().includes(search.replace(/\s/, '').toLowerCase())
                ),
              ];
            })
            .filter(([_, scripts]) => scripts.length > 0)
        )
      );
    }
  }, 300);
  useEffect(() => {
    run(search, defaultMenus);
    return cancel;
  }, [cancel, run, search, defaultMenus]);

  return {
    menus,
    search,
    setSearch,
  };
}

export function useCustomScripts() {
  return useSelector(({ project }: EditorState) => {
    while (project.editor.prevState) {
      project = project.editor.prevState;
    }
    return project.customScripts;
  }, isEqual);
}
