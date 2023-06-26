import type { Spark, OpenKeys, IContext, Index, IBlockSpark } from '../types';
import { neverThrow, NULL_SPARK } from './dummy';
import { uniq } from 'lodash';

export const getIndexer = (indices: Index, get = (value?: any, index?: any) => value?.[index]) => {
  const isArray = Array.isArray(indices);
  const indexValue = (value?: any) => (isArray ? indices.map(index => get(value, index)) : get(value, indices));
  const indexEntries = (value?: any): [string | number, any][] =>
    isArray ? indices.map((index, i) => [index, value[i]]) : [[indices, value]];
  return { indexValue, indexEntries };
};

export const enterOpenKeys = (
  openKeys: IContext['openKeys'],
  index: string | number,
  group: Spark
): IContext['openKeys'] => {
  const enterValue = (openKeys: OpenKeys = []) => {
    for (const openKey of openKeys) {
      if (Array.isArray(openKey) && openKey[0] === index) {
        return openKey[1];
      }
    }
  };
  const keys = enterValue(openKeys.openKeys);
  return {
    ...openKeys,
    openKeys: keys,
    setOpenKeys: (checked, slice, ids) => {
      if (!ids?.length) {
        slice = [[index, updateIndices(keys ?? collectIndices(group, ['required', 'recommended']), checked, slice)]];
      }
      openKeys.setOpenKeys?.(checked, slice, ids);
    },
  };
};

export const mergeOpenKeys = (openKeys1: OpenKeys, openKeys2: OpenKeys): OpenKeys => {
  return openKeys1.reduce((openKeys, key) => {
    if (Array.isArray(key)) {
      const key_ = openKeys2.find(item => Array.isArray(item) && item[0] === key[0]);
      if (key_) {
        openKeys.push([key[0], mergeOpenKeys(key[1], (key_ as any)[1])]);
      }
    } else if (openKeys2.some(item => item === key)) {
      openKeys.push(key);
    }
    return openKeys;
  }, [] as OpenKeys);
};

export const collectIndices = (
  cell: Spark,
  status: IBlockSpark['status'][],
  blocked = false,
  openKeys: OpenKeys = []
): OpenKeys => {
  if (cell.hidden) {
    return openKeys;
  }
  switch (cell.spark) {
    case 'block':
      if (blocked || status.includes(cell.status ?? 'optional')) {
        if (cell.indices) {
          return uniq(openKeys.concat(cell.indices));
        }
        return collectIndices(cell.content, status, true, openKeys);
      }
      return openKeys;
    case 'grid':
    case 'flex':
      return (cell.content as Spark[]).reduce(
        (openKeys, content) => collectIndices(content, status, blocked, openKeys),
        openKeys
      );
    case 'group':
      return cell.extra
        ? collectIndices(cell.extra, status, blocked, collectIndices(cell.content, status, blocked, openKeys))
        : collectIndices(cell.content, status, blocked, openKeys);
    case 'context':
    case 'check':
    case 'label':
    case 'visit':
      return collectIndices(cell.content, status, blocked, openKeys);
    case 'boolean':
    case 'number':
    case 'slider':
    case 'select':
    case 'string':
    case 'enter':
    case 'color':
    case 'value':
    case 'radioGroup':
    case 'dateRange':
      return blocked ? uniq(openKeys.concat(cell.index)) : openKeys;
    case 'element':
      return openKeys;
    default:
      return neverThrow(cell);
  }
};

export const updateIndices = (openKeys: OpenKeys, checked: boolean, slice: OpenKeys) => {
  const isEqual = (key1: OpenKeys[number]) => {
    if (Array.isArray(key1)) {
      return (key2: OpenKeys[number]) => Array.isArray(key2) && key1[0] === key2[0];
    }
    return (key2: OpenKeys[number]) => !Array.isArray(key2) && key1 === key2;
  };
  if (checked) {
    const keys = slice.slice();
    for (const key of openKeys) {
      if (!keys.some(isEqual(key))) {
        keys.push(key);
      }
    }
    return keys;
  }
  return openKeys.reduce((keys, key) => {
    if (!slice.some(isEqual(key))) {
      keys.push(key);
    }
    return keys;
  }, slice.filter(Array.isArray));
};

export const mergeSpark = (content1: Spark, content2: Spark) =>
  filterIndices(
    content1,
    collectIndices(content2, ['required', 'recommended', 'optional', 'closed', 'static'], true),
    false
  );

export const filterIndices = (content: Spark, indices: OpenKeys = [], blocked = true): Spark => {
  if (content.hidden) {
    return NULL_SPARK;
  }
  switch (content.spark) {
    case 'context':
    case 'check':
    case 'visit':
    case 'block':
    case 'label':
      if (content.spark === 'block' && blocked) {
        const required = collectIndices(content, ['required', 'recommended', 'optional'], true);
        if (required.some(index => !indices.includes(index))) {
          return NULL_SPARK;
        }
        return content;
      }
      const target = filterIndices(content.content, indices, blocked);
      if (target !== NULL_SPARK) {
        return moveHidden({
          ...content,
          content: target,
        });
      }
      return NULL_SPARK;
    case 'group':
      const target1 = filterIndices(content.content, indices, blocked);
      const target2 = filterIndices(content.extra || NULL_SPARK, indices, blocked);
      if (target1 === NULL_SPARK && target2 === NULL_SPARK) {
        return NULL_SPARK;
      }
      return moveHidden({
        ...content,
        content: target1,
        extra: target2 === NULL_SPARK ? undefined : target2,
      });
    case 'flex':
    case 'grid':
      const targets = content.content
        .map(content => filterIndices(content, indices, blocked))
        .filter(target => target !== NULL_SPARK);
      if (targets.length) {
        return moveHidden({
          ...content,
          content: targets,
        });
      }
      return NULL_SPARK;
    default:
      if (blocked || content.spark === 'element' || [content.index].flat().some(index => !indices.includes(index))) {
        return NULL_SPARK;
      }
      return content;
  }
};

const moveHidden = (content: Spark) => {
  switch (content.spark) {
    case 'grid':
    case 'flex':
      if (
        content.content.length === 1 &&
        content.content[0].spark === 'check' &&
        'hidden' in content.content[0].check
      ) {
        const { hidden } = content.content[0].check;
        return {
          ...content.content[0],
          check: { hidden },
          content,
        };
      }
      return content;
    case 'context':
    case 'group':
      if (content.content.spark === 'check' && 'hidden' in content.content.check) {
        const { hidden } = content.content.check;
        return {
          ...content.content,
          check: { hidden },
          content,
        };
      }
      return content;
    default:
      return content;
  }
};
