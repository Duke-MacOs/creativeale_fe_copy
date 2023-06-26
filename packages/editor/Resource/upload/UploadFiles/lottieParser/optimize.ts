import { cloneDeep, isArray, isEqual } from 'lodash';
import { isRecord } from '@riko-prop/util';
import { newID } from '@editor/utils';
import { updateChildId } from './utils';

// 调试
const debug = new URLSearchParams(window.location.search).get('debug');

const emptyContainer = (extendsNode: any, nodes: any[] = []) => {
  return {
    id: newID(),
    type: 'Container',
    props: {
      name: '容器',
      width: 0,
      height: 0,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      x: 0,
      y: 0,
      ...extendsNode.props,
    },
    nodes,
  };
};

export const trkMatte = (nodes: any[]) => {
  for (let i = 1; i < nodes.length; i++) {
    const node = nodes[i];
    const prev = nodes[i - 1];
    if (node.props.asMask && prev.ind == node.ind + 1) {
      delete node.ind;
      node.props.x -= prev.props.x;
      node.props.y -= prev.props.y;
      // https://lottiefiles.com/share/krcfom08
      // 如果是 Container 组合情况时，需要在外层再包裹一个 Container，防止蒙版跟随 Container 移动
      if (prev.type === 'Container') {
        const newContainer = emptyContainer(prev, [prev, node]);
        prev.props.x = 0;
        prev.props.y = 0;
        nodes.splice(i - 1, 0, newContainer);
        nodes.splice(i, 2);
      } else {
        // 其余情况，将蒙版直接放入即可
        prev.nodes.push(node);
        nodes.splice(i, 1);
      }
    }
  }
};

export const optimizeLoopLayer = (idx: number, layers: any[], doneInds: number[]) => {
  const inds: number[] = [];
  const target = layers[idx];
  const relativeKsIpTarget = relativeKsIp(target);
  const duration = target.op - target.ip;
  let intervalTime = -1;
  let count = 0;
  for (let i = idx + 1; i < layers.length; i++) {
    const layer = layers[i];
    if (
      layer.refId !== target.refId ||
      layer.op - layer.ip != duration ||
      inds.includes(layer.ind) ||
      doneInds.includes(layer.ind)
    ) {
      break;
    } else if (isEqual(relativeKsIpTarget.ks, relativeKsIp(layer).ks)) {
      const gap = i == idx + 1 ? target.ip - layer.op : layers[i - 1].ip - layer.op;
      if (intervalTime != -1 && gap != intervalTime) {
        break;
      } else {
        debug &&
          console.log({
            type: 'optimizeLoopLayer',
            target: cloneDeep(target),
            loop: cloneDeep(layer),
          });
        count++;
        intervalTime = gap;
        target._loop = `${count}_${gap}`;
        target.ip = layer.ip;
        target.op = layer.op;
        target.st = layer.st;
        target.ks = layer.ks;
        inds.push(layer.ind);
      }
    }
  }

  return inds;
};

export const optimizeRefId = (assets: any[], layers: any[]) => {
  // loop layer
  let loopInds: number[] = [];
  for (let i = 0; i < assets.length; i++) {
    const list = [];
    for (let j = 0; j < layers.length; j++) {
      const layer = layers[j];
      if (layer.refId == assets[i].id && !loopInds.includes(layer.ind)) {
        list.push(j);
      }
    }
    for (let j = 0; j < list.length; j++) {
      const idx = list[j];
      const layer = layers[idx];
      if (!loopInds.includes(layer.ind)) {
        loopInds = loopInds.concat(optimizeLoopLayer(idx, layers, loopInds));
      }
    }
  }

  const noLoopLayers = [];
  for (let i = 0; i < layers.length; i++) {
    if (!loopInds.includes(layers[i].ind)) {
      noLoopLayers.push(layers[i]);
    }
  }

  // union layer
  let unionInds: number[] = [];
  for (let i = 0; i < assets.length; i++) {
    const list = [];
    for (let j = 0; j < noLoopLayers.length; j++) {
      const layer = noLoopLayers[j];
      if (layer.refId == assets[i].id && !unionInds.includes(layer.ind)) {
        list.push(j);
      }
    }
    for (let j = 0; j < list.length; j++) {
      const idx = list[j];
      const layer = noLoopLayers[idx];
      if (!unionInds.includes(layer.ind)) {
        unionInds = unionInds.concat(optimizeUnionLayer(idx, noLoopLayers, unionInds));
      }
    }
  }

  const noUnionLayers = [];
  for (let i = 0; i < noLoopLayers.length; i++) {
    if (!unionInds.includes(noLoopLayers[i].ind)) {
      noUnionLayers.push(noLoopLayers[i]);
    }
  }

  return noUnionLayers;
};

export const optimizeUnionLayer = (idx: number, layers: any[], doneInds: number[]) => {
  const inds: number[] = [];
  let target = layers[idx];
  for (let i = idx + 1; i < layers.length; i++) {
    let layer = layers[i];
    if (
      layer.refId !== target.refId ||
      target?.tm?.k != layer?.tm?.k ||
      target._loop ||
      layer._loop ||
      !(target.op == layer.ip || target.ip == layer.op) ||
      inds.includes(layer.ind) ||
      doneInds.includes(layer.ind)
    ) {
      break;
    } else if (target.op == layer.ip || target.ip == layer.op) {
      if (target.ip == layer.op) {
        const temp = target;
        target = layer;
        layer = temp;
      }
      const newLayer = unionLayerKs(target, layer);
      if (newLayer) {
        target.op = layer.op;
        target.ks = newLayer.ks;
        inds.push(layer.ind);
      }
    }
  }

  return inds;
};

export const optimizeParent = (node: any) => {
  const nodeMap: { [Key: number]: any } = {};
  for (let i = 0; i < node.nodes.length; i++) {
    const item = node.nodes[i];
    nodeMap[item.ind] = item;
    delete item.ind;
  }
  fillParent(node.nodes, nodeMap);
};

export const optimizeInvalidKs = (layers: any[]) => {
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const op = layer.op;
    const ip = layer.ip;
    const keys = Object.keys(layer.ks ?? {});
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      if (['o', 'r'].includes(key)) {
        const ks = layer.ks?.[key];
        if (isArray(ks?.k)) {
          const newKs = validKs(ks?.k, ip, op);
          layer.ks[key].k = isRecord(newKs[0]) ? newKs : newKs[0];
        }
      } else {
        const ks = layer.ks?.[key];
        if (isRecord(ks?.k[0])) {
          layer.ks[key].k = validKs(ks?.k, ip, op);
        }
      }
    }
  }
  return layers;
};

const relativeKsIp = (layer: any) => {
  const cloneLayer = cloneDeep(layer);
  const ip = cloneLayer.ip;
  const keys = Object.keys(cloneLayer.ks ?? {});
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (['o', 'r'].includes(key)) {
      const ks = cloneLayer.ks?.[key];
      if (isArray(ks?.k)) {
        for (let i = 0; i < ks.k.length; i++) {
          ks.k[i].t -= ip;
        }
      }
    } else {
      const ks = cloneLayer.ks?.[key];
      if (isRecord(ks?.k[0])) {
        for (let i = 0; i < ks.k.length; i++) {
          ks.k[i].t -= ip;
        }
      }
    }
  }

  return cloneLayer;
};

const unionLayerKs = (target: any, next: any) => {
  const cloneTar = cloneDeep(target);
  const keys = Object.keys(target.ks ?? {});
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (['o', 'r'].includes(key)) {
      const tarKs = target.ks?.[key];
      const nextKs = next.ks?.[key];
      if (!isArray(tarKs?.k) && isArray(nextKs?.k)) {
        if (tarKs?.k != nextKs.k[0].s[0] || nextKs.k[0].t < target.op) {
          return null;
        } else {
          cloneTar.ks[key] = nextKs;
          cloneTar.op = next.op;
        }
      } else if (!isArray(tarKs?.k) && !isArray(nextKs?.k)) {
        if (tarKs?.k != nextKs?.k) {
          return null;
        }
      } else if (isArray(tarKs?.k) && !isArray(nextKs?.k)) {
        if (tarKs.k[tarKs.k.length - 1].s[0] != nextKs?.k) {
          return null;
        }
      } else if (isArray(tarKs?.k) && isArray(nextKs?.k)) {
        if (tarKs.k[tarKs.k.length - 1].s[0] != nextKs.k[0].s[0] || nextKs.k[0].t < target.op) {
          return null;
        } else {
          cloneTar.ks[key] = { ...tarKs, k: tarKs.k.concat(nextKs.k) };
          cloneTar.op = next.op;
        }
      }
    } else {
      const tarKs = target.ks?.[key];
      const nextKs = next.ks?.[key];
      if (!isRecord(tarKs?.k[0]) && isRecord<any>(nextKs?.k[0])) {
        if (!isEqual(tarKs?.k, nextKs.k[0].s) || nextKs.k[0].t < target.op) {
          return null;
        } else {
          cloneTar.ks[key] = nextKs;
          cloneTar.op = next.op;
        }
      } else if (!isRecord(tarKs?.k[0]) && !isRecord(nextKs?.k[0])) {
        if (!isEqual(tarKs?.k, nextKs?.k)) {
          return null;
        }
      } else if (isRecord(tarKs?.k[0]) && !isRecord(nextKs?.k[0])) {
        if (!isEqual(tarKs.k[tarKs.k.length - 1].s, nextKs?.k)) {
          return null;
        }
      } else if (isRecord(tarKs?.k[0]) && isRecord<any>(nextKs?.k[0])) {
        if (!isEqual(tarKs.k[tarKs.k.length - 1].s, nextKs.k[0].s) || nextKs.k[0].t < target.op) {
          return null;
        } else {
          cloneTar.ks[key] = { ...tarKs, k: tarKs.k.concat(nextKs.k) };
          cloneTar.op = next.op;
        }
      }
    }
  }

  return cloneTar;
};

const fillParent = (nodes: any[], map: { [Key: number]: any }) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.parent) {
      const parent = cloneDeep(map[node.parent]);
      const prevNode = nodes[i - 1];
      if (prevNode && parent.id == prevNode.id) {
        prevNode.nodes.push(node);
        nodes.splice(i, 1);
        i -= 1;
      } else {
        parent.nodes = parent.nodes ?? [];
        parent.type = 'Container';
        parent.id = newID();
        delete parent.props.url;
        updateChildId(parent);
        parent.nodes.push(node);
        nodes[i] = parent;
      }
    }
    delete node.parent;
  }
};

const validKs = (ksItem: any[], ip: number, op: number) => {
  let newKsItem = [];
  for (let i = 0; i < ksItem.length; i++) {
    if ((ksItem[i].t >= op && i == 0) || (ksItem[i].t <= ip && i == ksItem.length - 1) || ksItem[i + 1]?.t <= ip) {
      break;
    } else {
      newKsItem.push(ksItem[i]);
    }
  }
  if (newKsItem.length == 0) {
    newKsItem = ksItem[ksItem.length - 1].s;
  }
  debug &&
    !isEqual(ksItem, newKsItem) &&
    console.log({
      type: 'validKs',
      ip,
      op,
      origin: ksItem,
      optimize: newKsItem,
    });
  return newKsItem;
};

/**
 * 修正资源的开始时间
 * asset 的开始时间要基于父级的首帧时间
 * @param layer 调用这个 asset 的 layer
 * @param json
 * @param topIp 顶层调用的 layer 的 ip 值
 */
export const reviseAssetsTime = (layer: any, json: any, topIp = layer.ip) => {
  const fatherIp = layer.ty === 0 ? topIp : layer.ip;
  const assets = json.assets;
  const keys = ['r', 'p', 'a', 's', 'o'];
  if (layer.refId) {
    const asset = assets.find((i: any) => i.id === layer.refId);
    if (asset?.layers) {
      asset.layers.forEach((layer: any) => {
        keys.forEach(key => {
          if (Array.isArray(layer?.ks?.[key]?.k)) {
            layer.ks?.[key].k.forEach((_k: any) => {
              if (_k.t !== undefined) _k.t += fatherIp;
            });
          }
        });

        // asset 如果是组件，那么它的 ip, op 已经是相对于根的 ip 的时间，不再需要修正
        if (layer.ip !== undefined && layer.ty !== 0) layer.ip += fatherIp;
        if (layer.op !== undefined && layer.ty !== 0) layer.op += fatherIp;

        reviseAssetsTime(layer, json, topIp);
      });
    }
  }
};
