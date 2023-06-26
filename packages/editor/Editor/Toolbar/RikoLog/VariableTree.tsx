import { useState, useEffect, useRef, memo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { Tree, Empty, message } from 'antd';
import { css } from 'emotion';
import { cloneDeep, filter } from 'lodash';
import { DownOutlined } from '@ant-design/icons';
import { HamburgerButton } from '@icon-park/react';
import { Key } from 'antd/lib/table/interface';
import { PlusIcon, TreeNode } from './VariableTreeInput';
import useDragY from './hooks/useDragY';
import { resizeStyle } from '.';
import { collectEvent, EventTypes, getGlobalVars } from '@editor/utils';
import { updateGlobalVars } from '@editor/aStore';
import { useEventBus } from '@byted/hooks';

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'loop';

export type TreeDataItem = {
  id: string;
  type: DataType;
  parentId?: string;
  objectValue: any;
  objectKey: string;
  children?: TreeDataItem[];
};

const record = {
  height: 150,
};

const createId = () => {
  return Math.floor(Math.random() * 10000000).toString();
};

const isCustomizeInstance = (data: any) => {
  return (
    Object.prototype.toString.call(data) === '[object Object]' &&
    data.constructor.name !== 'Object' &&
    data.constructor.name !== 'Array'
  );
};

// {[key: parentId + name]: {id, value}}
// 用于 diff 比较后替换原有 id，提升页面渲染性能
const stateIdMap: { [key: string]: { id: string; value: any } } = {};

export const getFather = (sources: TreeDataItem[], parentId: string | undefined): TreeDataItem | undefined => {
  if (parentId === undefined) return undefined;
  let res;
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source.id === parentId) {
      return source;
    }
    if (source.children && source.children.length > 0) {
      res = getFather(source.children, parentId);
    }
    if (res) return res;
  }
  return undefined;
};

const isValidChange = (target: TreeDataItem, sources: TreeDataItem[], parent: TreeDataItem | undefined): boolean => {
  // 数组 objectKey 为下标，不判空
  if ((parent === undefined || !Array.isArray(parent.objectValue)) && target.objectKey === '') {
    message.warning('key 值不能为空');
    return false;
  }
  for (let i = 0; i < sources.length; i++) {
    if (sources[i].objectKey === target.objectKey && sources[i].id !== target.id) {
      message.warning('Key 值重复了');
      return false;
    }
  }

  return true;
};

const VariableTree = ({ visible = true, isPlaying = false }) => {
  const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

  const [treeDataDom, setTreeDataDom] = useState<any>([]);

  const { mainRef, footerRef } = useDragY({ minHeight: 150, maxHeightEqualHeight: true, record });

  const readyToDeleteRef = useRef<boolean>(false);
  // Focus 时将值存储起来，Blur 时判断值是否改变，再决定是否修改 Store
  const currentFocusPrevValueRef = useRef<string | number>('');
  // 播放前将 Store 的 keys 保存，用于过滤掉在脚本中创建的变量
  const beforePlayStoreKeysRef = useRef<string[]>([]);

  const dispatch = useDispatch<EditorDispatch>();
  const { storeData, playing } = useSelector(({ project }: EditorState) => {
    return { storeData: getGlobalVars(project), playing: project.editor.playing };
  }, shallowEqual);

  useEffect(() => {
    if (playing && storeData) {
      beforePlayStoreKeysRef.current = Object.keys(storeData);
    }
  }, [playing]);

  useEffect(() => {
    if (readyToDeleteRef.current) {
      onUpdateVariable();
      readyToDeleteRef.current = false;
    }
  });

  // diff state
  useEffect(() => {
    // 过滤项目默认字段
    const omitKeys = ['SceneLoadingProgress', 'SupportShake'];
    const pickKeys = beforePlayStoreKeysRef.current;
    const nextState = Object.entries(storeData ?? [])
      ?.filter(
        item =>
          !omitKeys.includes(item[0]) && (playing ? pickKeys.includes(item[0]) : true) && !isCustomizeInstance(item[1])
      )
      ?.map(item => translateStoreToTree(item[1], item[0], []));
    setTreeData(nextState);
  }, [storeData]);

  useEffect(() => {
    setTreeDataDom(treeData?.map(i => createTreeDom(i)));
  }, [treeData]);

  const { trigger: loadScene } = useEventBus('forceSceneReload');
  const onUpdateVariable = () => {
    dispatch(updateGlobalVars(translateTreeToStore(treeData)));
    loadScene();
  };

  const createData = (type: DataType, parent?: TreeDataItem, children: TreeDataItem[] = []): TreeDataItem => {
    const parentChildren = parent?.children ?? treeData;
    const originName = {
      string: '文本',
      number: '数字',
      boolean: '开关',
      object: '对象',
      array: '数组',
      loop: '变量',
    }[type];
    let suffix = 0;
    let name = originName;
    while (parentChildren.find(child => child.objectKey === name)) {
      suffix += 1;
      name = `${originName}${suffix}`;
    }
    const res: TreeDataItem = {
      id: createId(),
      type,
      parentId: parent?.id,
      objectValue: {
        string: '',
        number: 0,
        boolean: true,
        object: {},
        array: [],
        loop: '',
      }[type],
      objectKey: name,
    };
    if (type === 'object' || type === 'array') res.children = children;
    return res;
  };

  const appendVariable = (target: any, item: TreeDataItem): void => {
    let value;
    if (item.type === 'string') {
      value = item.objectValue.toString();
      if (value === 'null') value = null;
      if (value === 'undefined') value = undefined;
    }
    if (item.type === 'boolean') value = item.objectValue;
    if (item.type === 'number')
      value = isNaN(Number(item.objectValue)) ? item.objectValue.toString() : Number(item.objectValue);
    if (Array.isArray(target)) {
      target.push(value);
    } else {
      target[item.objectKey] = value;
    }
  };

  const translateStoreToTree = (data: any, key = '', loopItems: any[], parentId?: string): TreeDataItem => {
    const { id: prevId } = stateIdMap[`${parentId}${key}`] ?? {};
    const type = Object.prototype.toString.call(data);

    const checkCircle = (): TreeDataItem | undefined => {
      if (loopItems.includes(data)) {
        const id = prevId ?? createId();
        stateIdMap[`${parentId}${key}`] = { id, value: data };
        return {
          id,
          type: 'loop',
          parentId: parentId,
          objectValue: `循环引用`,
          objectKey: key,
        };
      } else {
        loopItems.push(data);
        return undefined;
      }
    };

    if (type === '[object Array]') {
      const id = prevId ?? createId();
      stateIdMap[`${parentId}${key}`] = { id, value: data };
      return (
        checkCircle() ?? {
          id,
          type: 'array',
          parentId: parentId,
          objectValue: data,
          objectKey: key,
          children: data
            .filter((i: any) => !isCustomizeInstance(i))
            .map((item: any, idx: number) => translateStoreToTree(item, idx.toString(), loopItems, id)),
        }
      );
    }
    if (type === '[object Object]') {
      const id = prevId ?? createId();
      stateIdMap[`${parentId}${key}`] = { id, value: data };
      return (
        checkCircle() ?? {
          id,
          type: 'object',
          parentId: parentId,
          objectValue: data,
          objectKey: key,
          children: Object.entries(data)
            .filter(item => !isCustomizeInstance(item[1]))
            .map(item => translateStoreToTree(item[1], item[0], loopItems, id)),
        }
      );
    }
    const id = prevId ?? createId();
    stateIdMap[`${parentId}${key}`] = { id, value: data };
    return {
      id,
      type: (() => {
        if (type === '[object Number]') return 'number';
        if (type === '[object Boolean]') return 'boolean';
        return 'string';
      })(),
      parentId: parentId,
      // undefined、null 类型转为字符串
      objectValue: (() => {
        return type === '[object Number]' || type === '[object Boolean]' ? data : `${data}`;
      })(),
      objectKey: key,
    };
  };

  const translateTreeToStore = (list: TreeDataItem[]) => {
    const res = {};

    const dps = (item: TreeDataItem, target: any, fatherIsArray = false) => {
      // 如果 key 为空，这个变量将不会转化到新 store 中
      if (!fatherIsArray && item.objectKey === '') return;
      if (item.type === 'loop') return;

      const type = Object.prototype.toString.call(item.objectValue);

      if (type === '[object Array]' || type === '[object Object]') {
        const newTarget = type === '[object Array]' ? [] : {};
        if (Array.isArray(target)) {
          target.push(newTarget);
        } else {
          target[item.objectKey] = newTarget;
        }
        item.children?.forEach(i => dps(i, newTarget, Array.isArray(item.objectValue)));
        return;
      }

      appendVariable(target, item);
    };
    list.forEach(i => dps(i, res));

    return res;
  };

  const onFocusInput = (e: any) => {
    setSelectedKeys([e.target.id]);
    currentFocusPrevValueRef.current = e.target.value;
  };

  /**
   * 生成树形结构数据
   * @param item 树形结构数据
   * @param type 1:key 的树形结构；2:value 的树形结构
   * @returns
   */
  const createTreeDom: any = (item: TreeDataItem, arrayIdx?: number) => {
    if (!item) return undefined;

    const onAdd = (type: DataType) => {
      // 埋点
      if (type !== 'loop') {
        collectEvent(EventTypes.CreateGlobalVar, {
          type,
        });
      }
      const emptyData = createData(type, item);
      if (item.children) {
        if (expandedKeys.indexOf(item.id) === -1) {
          setExpandedKeys([...expandedKeys, item.id]);
        }
        item.children.push(emptyData);
        setTreeData(cloneDeep(treeData));
      }
      onUpdateVariable();
    };

    const onDelete = () => {
      const parent = getFather(treeData, item.parentId);
      if (parent && parent.children) {
        parent.children = filter(parent.children, (i: TreeDataItem) => i.id !== item.id);
        setTreeData(cloneDeep(treeData));
      } else {
        setTreeData(filter(treeData, (i: TreeDataItem) => i.id !== item.id));
      }
      readyToDeleteRef.current = true;
    };

    const onChangeKey = (value: string) => {
      const prevStateKey = `${item.parentId}${item.objectKey}`;
      const prevStateValue = stateIdMap[prevStateKey];
      const nextStateKey = `${item.parentId}${value}`;
      item.objectKey = value;
      stateIdMap[nextStateKey] = prevStateValue;
      delete stateIdMap[prevStateKey];
      setTreeData(cloneDeep(treeData));
    };

    const onChangeValue = (value: string) => {
      item.objectValue = value;
      setTreeData(cloneDeep(treeData));
    };

    const onBlur = (value: string, type: 'key' | 'value') => {
      setSelectedKeys([]);
      const father = getFather(treeData, item.parentId);
      const target = { ...item };
      if (type === 'key') target.objectKey = value;
      if (type === 'value') target.objectValue = value;
      const isValid = isValidChange(target, father?.children || treeData, father);

      if (value != currentFocusPrevValueRef.current && isValid) {
        if (type === 'key') onChangeKey(value);
        if (type === 'value') onChangeValue(value);
        onUpdateVariable();
      }
      return isValid;
    };

    const onSelect = (value: boolean) => {
      item.objectValue = value;
      setTreeData(cloneDeep(treeData));
      onUpdateVariable();
    };

    return {
      title: (
        <TreeNode
          key={item.id}
          item={item}
          arrayIdx={arrayIdx}
          value={arrayIdx ?? item.objectKey}
          disabled={arrayIdx !== undefined}
          visibleSuffixNode={true}
          lightTip={isPlaying}
          onAdd={onAdd}
          onDelete={onDelete}
          onFocus={onFocusInput}
          onFocusInput={onFocusInput}
          onBlur={onBlur}
          onSelect={onSelect}
        />
      ),
      key: item.id,
      children:
        item.children &&
        item?.children.map((i, idx) => createTreeDom(i, Array.isArray(item.objectValue) ? idx : undefined)),
    };
  };

  const onAddGlobalVar = (type: DataType) => {
    // 埋点
    if (type !== 'loop') {
      collectEvent(EventTypes.CreateGlobalVar, {
        type,
      });
    }
    const emptyData = createData(type);
    treeData.splice(0, 0, emptyData);
    setTreeData(cloneDeep(treeData));
    onUpdateVariable();
  };

  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys([...expandedKeys]);
  };

  return (
    <div
      className={css({
        display: visible ? 'unset' : 'none',
      })}
    >
      <div style={{ position: 'absolute', top: '5px', right: '10px' }}>
        <PlusIcon onAdd={onAddGlobalVar} />
      </div>
      <div
        ref={mainRef}
        className={css({
          display: 'flex',
          marginTop: '15px',
          paddingBottom: '20px',
          minWidth: '330px',
          minHeight: '150px',
          height: record.height,
          overflow: 'auto',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        })}
      >
        {treeDataDom.length > 0 ? (
          <Tree
            className={css({
              '.ant-tree': {
                background: 'inherit',
              },
              '.ant-tree-switcher': {
                marginRight: '-7px',
              },
            })}
            blockNode
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            switcherIcon={<DownOutlined />}
            onExpand={onExpand}
            treeData={treeDataDom}
          />
        ) : (
          <Empty description="暂无数据" style={{ margin: '0 auto' }} />
        )}
        <div className={resizeStyle} ref={footerRef}>
          <HamburgerButton theme="outline" size="10" fill="#333" />
        </div>
      </div>
    </div>
  );
};

export default memo(VariableTree);
