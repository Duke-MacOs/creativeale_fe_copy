import { isArray, isEqual, isString, cloneDeep } from 'lodash';
import { newID } from '@editor/utils';
import { createResource } from '@shared/api';
import { changeProps } from '@editor/aStore';
import { isRecord } from '@riko-prop/util';
import { optimizeRefId, optimizeInvalidKs, optimizeParent, trkMatte, reviseAssetsTime } from './optimize';
import {
  getTypeName,
  getLoop,
  getLeftTopPosition,
  getEase,
  getTextBoundingRect,
  asMask,
  getMatteTypeName,
  getBoundRect,
  getBoundRectCenter,
  getBoundRectSize,
  getAnchorPosition,
  resetNode,
} from './utils';
import { absoluteUrl } from '@shared/utils';

// 调试
const debug = new URLSearchParams(window.location.search).get('debug');

// 原始 json 数据
let globalJson: any = {
  ip: 0,
  op: 0,
  _errors: [],
};

export const parse = (json: any, resource: [string, string][]) => {
  globalJson = json;
  // init
  debug && console.log(`--- ${Date.now()} lottieParse ---`);

  // assets
  const assets = json.assets;
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const path = `${asset.u}${asset.p}`;
    const item = resource.find(res => res[0].endsWith(path));
    if (item) {
      asset.u = '';
      asset.p = item[1];
    }
  }

  // parse
  const layers = optimizeRefId(assets, optimizeInvalidKs(json.layers));
  const node = {
    id: newID(),
    type: 'Container',
    // anchorX、anchorY、scaleX、scaleY、rotation、x、y、scaleX、scaleY、width、height 必须存在
    props: {
      name: json.nm,
      width: json.w,
      height: json.h,
      anchorX: 0.5,
      anchorY: 0.5,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      x: 0,
      y: 0,
    },
    nodes: layers
      .reduce((nodes: any[], layer: any, idx: number) => {
        // assets 中的时间是相对于 layer 的开始时间
        // 为了防止每层 layer 之间相互污染，在转换时为每层 layer copy 一份 json
        const newJson = cloneDeep(json);
        reviseAssetsTime(layer, newJson);
        const node = parseLayer(layer, newJson);
        if (node) {
          node.props.asMask = asMask(idx, layers);
          nodes.push(node);
        } else {
          globalJson._errors.push(`不支持 “${layer.nm}” ${getTypeName(layer.ty)}节点`);
        }
        return nodes;
      }, [] as any[])
      .reverse(),
  };

  trkMatte(node.nodes);
  optimizeParent(node);

  return node;
};

const unSupportedFeature = (layer: any) => {
  if (layer.tm) {
    globalJson._errors.push(`不支持 “${layer.nm}” 图层的【时间映射】功能`);
  }
  if (layer.tt >= 2) {
    globalJson._errors.push(`不支持 “${layer.nm}” ${getMatteTypeName(layer.tt)}`);
  }
};

const parseLayer = (layer: any, json: any) => {
  unSupportedFeature(layer);
  switch (layer.ty) {
    case 2:
      return parseNode('Sprite', layer, json);
    case 5:
      return parseText(layer, json);
    case 9:
      return parseVideo(layer, json);
    case 0:
      return parseComp(layer, json);
    case 6:
      return parseSound(layer, json);
    case 4:
      return parseShape(layer, json);
    default:
      return null;
  }
};

const getBasicProps = (layer: any, assets: any[]) => {
  const res = assets.find((asset: any) => asset.id == layer.refId);
  const width = layer?.w ?? res?.w;
  const height = layer?.h ?? res?.h;

  const opacityKs = layer.ks?.o;
  const opacity = isArray(opacityKs?.k) ? opacityKs?.k[0]?.s[0] : opacityKs?.k;
  const anchorKs = layer.ks?.a;
  const anchor = isRecord(anchorKs?.k[0]) ? anchorKs?.k[0]?.s : anchorKs?.k;
  const positionKs = layer.ks?.p;
  const position = getLeftTopPosition(anchor, isRecord(positionKs?.k[0]) ? positionKs?.k[0]?.s : positionKs?.k);
  const rotationKs = layer.ks?.r;
  const rotation = isArray(rotationKs?.k) ? rotationKs?.k[0]?.s[0] : rotationKs?.k;
  const scaleKs = layer.ks?.s;
  const scale = isRecord(scaleKs?.k[0]) ? scaleKs?.k[0]?.s : scaleKs?.k;

  const anchorX = anchor[0] / width;
  const anchorY = anchor[1] / height;
  return {
    width,
    height,
    url: isString(res?.u) && isString(res?.p) ? `${res.u}${res.p}` : undefined,
    alpha: opacity / 100,
    anchorX: !isNaN(anchorX) ? anchorX : 0,
    anchorY: !isNaN(anchorY) ? anchorY : 0,
    x: position[0],
    y: position[1],
    rotation,
    scaleX: scale[0] / 100,
    scaleY: scale[0] / 100,
  };
};

const parseMask = (
  layer: any,
  json: any,
  anchorPos: { x: number; y: number },
  leftTopPos: { x: number; y: number }
) => {
  const masks = layer.masksProperties;
  const fps = json.fr;
  if (layer.hasMask && masks.length > 0) {
    if (masks.length > 1) {
      globalJson._errors.push(`不支持 “${layer.nm}” 多蒙版混合`);
    }
    const mask = masks.find((m: any) => m.mode == 'a');
    if (!mask) {
      globalJson._errors.push(`仅支持 “${layer.nm}” 相加蒙版`);
    } else {
      if (mask.inv) {
        globalJson._errors.push(`不支持 “${mask.nm}” 反转蒙版`);
      }

      const pts = mask.pt.k;
      const rect = isArray(pts) ? getBoundRect(pts[0].s[0].v) : getBoundRect(pts.v);
      const width = rect[1].x - rect[0].x;
      const height = rect[2].y - rect[1].y;
      const opacityKs = layer.ks?.o;
      const opacity = isArray(opacityKs.k) ? opacityKs.k[0].s[0] : opacityKs.k;

      const node = {
        id: newID(),
        type: 'Shape',
        name: mask.nm,
        props: {
          alpha: opacity / 100,
          shapeType: 'rectangle',
          anchorX: 0.5,
          anchorY: 0.5,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: rect[0].x + (layer.ty == 5 ? anchorPos.x - leftTopPos.x : 0),
          y: rect[0].y + (layer.ty == 5 ? anchorPos.y - leftTopPos.y : 0),
          width,
          height,
          asMask: true,
        },
        scripts: parseOpacityEffect(layer.ks?.o, fps, { count: 0, gap: 0, duration: 0 }),
      };

      if (isArray(pts)) {
        const boundRects = [];
        for (let i = 0; i < pts.length; i++) {
          boundRects.push(getBoundRect(pts[i].s[0].v));
        }
        for (let i = 0; i < pts.length - 1; i++) {
          const start = pts[i];
          const end = pts[i + 1];
          const rect1 = boundRects[i];
          const rect2 = boundRects[i + 1];
          const center1 = getBoundRectCenter(rect1);
          const center2 = getBoundRectCenter(rect2);
          if (!isEqual(center1, center2)) {
            node.scripts.push({
              id: newID(),
              type: 'Effect',
              props: {
                name: '位移动画',
                script: 'Move',
                presetAnchor: false,
                duration: ((end.t - start.t) / fps) * 1000,
                time: ((start.t - globalJson.ip) / fps) * 1000,
                ease: getEase(start.i, start.o),
                distanceX: center2.x - center1.x,
                distanceY: center2.y - center1.y,
                __script: ['baseEffect', 'Move_位移动画'],
              },
            });
          }

          const size1 = getBoundRectSize(rect1);
          const size2 = getBoundRectSize(rect2);
          if (!isEqual(size1, size2)) {
            node.scripts.push({
              id: newID(),
              type: 'Effect',
              props: {
                name: '缩放到',
                script: 'Scale',
                presetAnchor: false,
                duration: ((end.t - start.t) / fps) * 1000,
                time: (start.t / fps) * 1000,
                ease: getEase(start.i, start.o),
                scaleRangeX: size2.width / size1.width - 1,
                scaleRangeY: size2.height / size1.height - 1,
                __script: ['baseEffect', 'Scale'],
              },
            });
          }
        }
      }

      return node;
    }
  }
};

const parseNode = (type: string, layer: any, json: any) => {
  const { count, gap } = getLoop(layer._loop);
  const duration = layer.op - layer.ip;
  const finalOp = count > 0 ? layer.op + duration * count + (count - 1) * gap : layer.op;
  const basic = getBasicProps(layer, json.assets);
  const global = {
    fr: json.fr,
    ip: json.ip,
    op: json.op,
  };

  const node: any = {
    id: newID(),
    type,
    ind: layer.ind,
    parent: layer.parent,
    props: {
      name: layer.nm,
      ...basic,
      visible: layer.ip - json.ip > json.ip ? false : true,
    },
    nodes: [],
    scripts: parseOpacityEffect(layer.ks?.o, global.fr, { count, gap, duration })
      .concat(parseRotationEffect(layer.ks?.r, global.fr, { count, gap, duration }))
      .concat(parseScaleEffect(layer.ks?.s, global.fr, { count, gap, duration }))
      .concat(parsePositionEffect(layer.ks?.p, global.fr, { count, gap, duration }))
      .concat(parseVisibleEffect(global, layer.ip, finalOp)),
  };

  if (basic.width > 0 && basic.height > 0) {
    node.scripts = node.scripts.concat(
      parseAnchorEffect(layer.ks?.a, global.fr, basic.width, basic.height, { count, gap, duration })
    );
    const mask = parseMask(layer, json, getAnchorPosition(node.props), { x: node.props.x, y: node.props.y });
    if (mask) {
      node.nodes.push(mask);
    }
  }

  return node;
};

const parseShape = (layer: any, json: any) => {
  const node = parseNode('Container', layer, json);
  delete node.props.url;
  const shapes = layer.shapes;
  shapes.forEach((shape: any) => {
    const rectIt = shape.it.find((it: any) => it.ty == 'rc');
    if (rectIt) {
      const rect = parseRect(rectIt, shape);
      parseShapeFill(rect, shape);
      parseShapeStroke(rect, shape);
      node.props.width = 0;
      node.props.height = 0;
      node.nodes.push(rect);
    } else {
      globalJson._errors.push(`不支持 “${layer.nm} ${shape.nm}”`);
    }
  });

  return node;
};

const parseShapeFill = (node: any, shape: any) => {
  const fill = shape.it.find((it: any) => it.ty == 'fl');
  if (fill) {
    const colorKs = fill.c;
    const color = isRecord(colorKs.k[0]) ? colorKs.k[0].s : colorKs.k;
    const opacityKs = fill.o;
    const opacity = isArray(opacityKs.k) ? opacityKs.k[0].s[0] : opacityKs.k;
    node.props.fillColor = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
      (color[3] * opacity) / 100
    })`;
  }
};

const parseShapeStroke = (node: any, shape: any) => {
  const stroke = shape.it.find((it: any) => it.ty == 'st');
  if (stroke) {
    const colorKs = stroke.c;
    const color = isRecord(colorKs.k[0]) ? colorKs.k[0].s : colorKs.k;
    const opacityKs = stroke.o;
    const opacity = isArray(opacityKs.k) ? opacityKs.k[0].s[0] : opacityKs.k;
    const strokeWidthKs = stroke.w;
    const strokeWidth = isArray(strokeWidthKs.k) ? strokeWidthKs.k[0].s[0] : strokeWidthKs.k;
    node.props.lineColor = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${
      (color[3] * opacity) / 100
    })`;
    node.props.lineWidth = strokeWidth;
  }
};

const parseRect = (rectIt: any, shape: any) => {
  const sizeKs = rectIt.s;
  const size = isRecord(sizeKs.k[0]) ? sizeKs.k[0].s : sizeKs.k;
  const radiusKs = rectIt.r;
  const radius = isArray(radiusKs.k) ? radiusKs.k[0].s[0] : radiusKs.k;
  const rectPosKs = rectIt.p;
  const rectPos = isRecord(rectPosKs.k[0]) ? rectPosKs.k[0].s : rectPosKs.k;

  const transform = shape.it.find((it: any) => it.ty == 'tr');
  const anchorKs = transform.a;
  const anchor = isRecord(anchorKs.k[0]) ? anchorKs.k[0].s : anchorKs.k;
  const scaleKs = transform.s;
  const scale = isRecord(scaleKs.k[0]) ? scaleKs.k[0].s : scaleKs.k;
  const rotationKs = transform.r;
  const rotation = isArray(rotationKs.k) ? rotationKs.k[0].s[0] : rotationKs.k;
  const positionKs = transform.p;
  const position = getLeftTopPosition(
    [size[0] / 2 + anchor[0] - rectPos[0], size[1] / 2 + anchor[1] - rectPos[1]],
    isRecord(positionKs.k[0]) ? positionKs.k[0].s : positionKs.k
  );

  const rect: any = {
    id: newID(),
    type: 'Shape',
    props: {
      name: rectIt.nm,
      shapeType: 'rectangle',
      width: size[0],
      height: size[1],
      roundedSize: radius,
      x: position[0],
      y: position[1],
      scaleX: scale[0] / 100,
      scaleY: scale[1] / 100,
      rotation,
      alpha: 1,
    },
    nodes: [],
  };

  // 锚点偏移
  const offset = {
    x: rectPos[0] - anchor[0],
    y: rectPos[1] - anchor[1],
  };
  rect.props.anchorX = 0.5 - offset.x / size[0];
  rect.props.anchorY = 0.5 - offset.y / size[1];

  return rect;
};

const parseText = (layer: any, json: any) => {
  const node = parseNode('Text', layer, json);
  delete node.url;

  const documentData = layer.t.d.k[0].s;
  const fc = documentData.fc;
  node.props.color = `rgba(${fc[0] * 255},${fc[1] * 255},${fc[2] * 255},1)`;
  node.props.fontSize = documentData.s;
  node.props.text = documentData.t.replaceAll('\r', '\r\n');
  node.props.valign = 'middle';
  const lineNum = node.props.text.split('\r\n').length;
  node.props.height = lineNum * documentData.lh;

  const boundingRect = getTextBoundingRect(
    {
      width: json.w,
      height: json.h,
    },
    {
      ...node.props,
      font: documentData.f,
    }
  );
  let alignWidth = 0;
  switch (documentData.j) {
    case 2:
      alignWidth += boundingRect.width / 2;
      node.props.align = 'center';
      break;
    case 1:
      alignWidth += boundingRect.width;
      node.props.align = 'right';
      break;
    default:
      node.props.align = 'left';
      break;
  }
  node.props.width = boundingRect.width;
  const offset = {
    x: boundingRect.left - alignWidth,
    y: boundingRect.top,
  };
  node.props.anchorX -= offset.x / node.props.width;
  node.props.anchorY -= offset.y / node.props.height;
  node.props.x += offset.x;
  node.props.y += offset.y;

  const { count, gap } = getLoop(layer._loop);
  const duration = layer.op - layer.ip;
  node.scripts = node.scripts.concat(
    parseAnchorEffect(layer.ks?.a, json.fr, node.props.width, node.props.height, { count, gap, duration })
  );
  const mask = parseMask(layer, json, getAnchorPosition(node.props), { x: node.props.x, y: node.props.y });
  if (mask) {
    node.nodes.push(mask);
  }

  return node;
};

const parseSound = (layer: any, json: any) => {
  const res = json.assets.find((asset: any) => asset.id == layer.refId);
  const duration = layer.op - layer.ip;
  const { count, gap } = getLoop(layer._loop);
  const node: any = {
    id: newID(),
    type: 'Sound',
    ind: layer.ind,
    parent: layer.parent,
    props: {
      name: layer.nm,
      url: `${res.u}${res.p}`,
    },
    scripts: parseController(json.fr, layer.nm, layer.ip, layer.op, { count, gap, duration }),
  };

  return node;
};

const parseVideo = (layer: any, json: any) => {
  const node = parseNode('Video', layer, json);
  if (layer.tm) {
    const projectId = json._projectId;
    const dispatch = json._dispatch;
    const url = node.props.url;
    node.type = 'Sprite';
    node.props.url = '';
    screenshot(node, url, layer.tm.k, projectId, img => {
      dispatch(changeProps([node.id], { url: img.url }));
    });
  } else {
    const duration = layer.op - layer.ip;
    const { count, gap } = getLoop(layer._loop);
    node.scripts = node.scripts.concat(
      parseController(json.fr, layer.nm, layer.ip, layer.op, { count, gap, duration })
    );
  }
  return node;
};

const screenshot = (node: any, url: string, time: number, projectId: number, callback: (img: any) => void) => {
  const $video = document.createElement('video');
  const props = node.props;
  $video.muted = true;
  $video.setAttribute('crossOrigin', 'Anonymous');
  $video.src = absoluteUrl(url);
  $video.width = props.width;
  $video.height = props.height;
  $video.play();

  const $canvas = document.createElement('canvas');
  $canvas.width = props.width;
  $canvas.height = props.height;
  const ctx = $canvas.getContext('2d');

  $video.onplay = () => {
    $video.currentTime = time;
  };

  if (ctx) {
    $video.onseeked = async () => {
      $video.pause();
      ctx.drawImage($video, 0, 0, props.width, props.height);
      $canvas.toBlob(
        file => {
          if (file) {
            createResource({ file: new File([file], `${props.name}.jpg`), type: 5, ...{ projectId } }).then(callback);
          }
        },
        `image/jpeg`,
        0.8
      );
    };
  }
};

const parseComp = (layer: any, json: any) => {
  const compNode = parseNode('Container', layer, json);
  const assets = json.assets;
  const res = assets.find((asset: any) => asset.id == layer.refId);

  const layers = optimizeRefId(assets, optimizeInvalidKs(res.layers));
  const { count, gap } = getLoop(layer._loop);
  const duration = layer.op - layer.ip;

  compNode.nodes = compNode.nodes.concat(
    layers
      .reduce((nodes: any[], layer: any, idx: number) => {
        const node = parseLayer(layer, json);
        if (node) {
          node.props.asMask = asMask(idx, layers);

          const loopScripts: any[] = [];
          for (let i = 0; i < count; i++) {
            node.scripts.forEach((script: any) => {
              const itemScript = cloneDeep(script);
              itemScript.id = newID();
              itemScript.props.time += (((i + 1) * (duration + gap)) / json.fr) * 1000;
              loopScripts.push(itemScript);
              resetNode(node, (((i + 1) * (duration + gap) + layer.ip) / json.fr) * 1000);
            });
          }
          node.scripts = node.scripts.concat(loopScripts);
          nodes.push(node);
        } else {
          globalJson._errors.push(`不支持 “${layer.nm}” ${getTypeName(layer.ty)}节点`);
        }
        return nodes;
      }, [] as any[])
      .reverse()
  );

  trkMatte(compNode.nodes);
  optimizeParent(compNode);
  return compNode;
};

const parseController = (
  fps: number,
  name: string,
  ip: number,
  op: number,
  loop: { count: number; gap: number; duration: number }
) => {
  const duration = op - ip;
  const events = [];
  events.push({
    id: newID(),
    type: 'Controller',
    props: {
      script: 'Controller',
      name,
      time: ((ip - globalJson.ip) / fps) * 1000,
      loop: loop.count > 0,
      loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
      duration: (duration / fps) * 1000,
    },
  });

  return events;
};

const parseVisibleEffect = (global: { ip: number; op: number; fr: number }, ip: number, op: number) => {
  const fps = global.fr;
  const events = [];
  if (ip > global.ip) {
    events.push({
      id: newID(),
      type: 'Effect',
      props: {
        name: '立即出现',
        script: 'ImmediateIO',
        time: ((ip - global.ip) / fps) * 1000,
        duration: 0,
        __script: ['inEffect', 'ImmediateIO_立即出现'],
      },
    });
  }
  if (op <= global.op) {
    events.push({
      id: newID(),
      type: 'Effect',
      props: {
        name: '立即消失',
        isInEffect: false,
        script: 'ImmediateIO',
        time: ((op - global.ip) / fps) * 1000,
        duration: 0,
        __script: ['outEffect', 'ImmediateIO_立即消失'],
      },
    });
  }

  return events;
};

const parsePositionEffect = (position: any, fps: number, loop: { count: number; gap: number; duration: number }) => {
  const k = position?.k;
  const effects: any[] = [];
  if (isRecord(k[0])) {
    for (let i = 0; i < k.length - 1; i++) {
      const start = k[i];
      const end = k[i + 1];
      if (isEqual(start.s, end.s)) {
        continue;
      }
      const duration = end.t - start.t;
      const effect = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '位移动画',
          script: 'Move',
          presetAnchor: false,
          duration: ((end.t - start.t) / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          distanceX: end.s[0] - start.s[0],
          distanceY: end.s[1] - start.s[1],
          __script: ['baseEffect', 'Move_位移动画'],
        },
      };
      effects.push(effect);
    }
  }
  return effects;
};

const parseAnchorEffect = (
  anchor: any,
  fps: number,
  width: number,
  height: number,
  loop: { count: number; gap: number; duration: number }
) => {
  const k = anchor?.k;
  const effects: any[] = [];
  if (isRecord(k[0])) {
    for (let i = 0; i < k.length - 1; i++) {
      const start = k[i];
      const end = k[i + 1];
      if (isEqual(start.s, end.s)) {
        continue;
      }
      const duration = end.t - start.t;
      const effect1 = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '锚点动画',
          script: 'Anchor',
          duration: ((end.t - start.t) / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          axisX: (end.s[0] - start.s[0]) / width,
          axisY: (end.s[1] - start.s[1]) / height,
          __script: ['baseEffect', 'Anchor_锚点动画'],
        },
      };
      const effect2 = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '位移动画',
          script: 'Move',
          presetAnchor: false,
          duration: ((end.t - start.t) / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          distanceX: start.s[0] - end.s[0],
          distanceY: start.s[1] - end.s[1],
          __script: ['baseEffect', 'Move_位移动画'],
        },
      };
      effects.push(effect1);
      effects.push(effect2);
    }
  }
  return effects;
};

const parseScaleEffect = (scale: any, fps: number, loop: { count: number; gap: number; duration: number }) => {
  const k = scale?.k;
  const effects: any[] = [];
  if (isRecord(k[0])) {
    for (let i = 0; i < k.length - 1; i++) {
      const start = k[i];
      const end = k[i + 1];
      if (isEqual(start.s, end.s)) {
        continue;
      }
      const duration = end.t - start.t;
      const effect = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '缩放到',
          script: 'ScaleTo',
          presetAnchor: false,
          duration: ((end.t - start.t) / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          scaleX: end.s[0] / 100,
          scaleY: end.s[1] / 100,
          __script: ['baseEffect', 'ScaleTo_缩放到'],
        },
      };
      effects.push(effect);
    }
  }
  return effects;
};

const parseOpacityEffect = (opacity: any, fps: number, loop: { count: number; gap: number; duration: number }) => {
  const k = opacity?.k;
  const effects: any[] = [];
  if (isArray(k)) {
    for (let i = 0; i < k.length - 1; i++) {
      const start = k[i];
      const end = k[i + 1];
      if (isEqual(start.s, end.s)) {
        continue;
      }
      const duration = end.t - start.t;
      const effect = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '透明动画',
          script: 'AlphaTo',
          duration: (duration / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          alpha: end.s[0] / 100,
          __script: ['baseEffect', 'AlphaTo_透明动画'],
        },
      };
      effects.push(effect);
    }
  }
  return effects;
};

const parseRotationEffect = (rotation: any, fps: number, loop: { count: number; gap: number; duration: number }) => {
  const k = rotation?.k;
  const effects: any[] = [];
  if (isArray(k)) {
    for (let i = 0; i < k.length - 1; i++) {
      const start = k[i];
      const end = k[i + 1];
      if (isEqual(start.s, end.s)) {
        continue;
      }
      const duration = end.t - start.t;
      const effect = {
        id: newID(),
        type: 'Effect',
        props: {
          name: '旋转动画',
          script: 'Rotate',
          presetAnchor: false,
          duration: (duration / fps) * 1000,
          time: ((start.t - globalJson.ip) / fps) * 1000,
          ease: getEase(start.i, start.o),
          loop: loop.count > 0,
          loopInterval: loop.count > 0 ? ((loop.gap + loop.duration - duration) / fps) * 1000 : 0,
          rotateRange: end.s[0] - start.s[0],
          __script: ['baseEffect', 'Rotate_旋转动画'],
        },
      };
      effects.push(effect);
    }
  }
  return effects;
};
