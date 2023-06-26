import { newID } from '@editor/utils';
import { isArray } from 'lodash';
const lottieSVG = 'lottie-svg';

export const resetNode = (node: any, time: number) => {
  const keys = ['x', 'y', 'alpha', 'rotation', 'anchorX', 'anchorY', 'scaleX', 'scaleY'];
  if (node.scripts.find((script: any) => script.props.script == 'ImmediateIO')) {
    keys.push('visible');
  }
  const resetScript = {
    id: newID(),
    type: 'Script',
    props: {
      script: 'Auto',
      name: '自动触发',
      time,
      scripts: keys.reduce((list: any[], key) => {
        const modifyData = {
          editor: {},
          id: newID(),
          type: 'Script',
          props: {
            name: '赋值',
            script: 'ModifyData',
            time: 0,
            _event_option: true,
            enabled: true,
            expression: {
              from: { ids: [-1], key, type: 'node' },
              mode: '=',
              to: node.props[key],
            },
          },
        };
        list.push(modifyData);
        return list;
      }, []),
    },
  };
  node.scripts.push(resetScript);
};

export const updateChildId = (target: any) => {
  const sList = target.scripts ?? [];
  for (let i = 0; i < sList.length; i++) {
    sList[i].id = newID();
  }

  const nodes = target.nodes ?? [];
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].id = newID();
    const children = nodes[i].nodes ?? [];
    const scripts = nodes[i].scripts ?? [];
    if ((isArray(children) && children.length > 0) || (isArray(scripts) && scripts.length > 0)) {
      updateChildId(nodes[i]);
    }
  }
};

export const getBoundRect = (points: number[][]) => {
  let minX = points[0][0];
  let minY = points[0][1];
  let maxX = points[0][0];
  let maxY = points[0][1];
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (p[0] < minX) {
      minX = p[0];
    } else if (p[0] > maxX) {
      maxX = p[0];
    }
    if (p[1] < minY) {
      minY = p[1];
    } else if (p[1] > maxY) {
      maxY = p[1];
    }
  }
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
};

export const getAnchorPosition = (props: {
  anchorX: number;
  anchorY: number;
  width: number;
  height: number;
  x: number;
  y: number;
}) => {
  return {
    x: props.x + props.anchorX * props.width,
    y: props.y + props.anchorY * props.height,
  };
};

export const getBoundRectCenter = (pts: Array<{ x: number; y: number }>) => {
  return {
    x: (pts[0].x + pts[1].x) / 2,
    y: (pts[0].y + pts[3].y) / 2,
  };
};

export const getBoundRectSize = (pts: Array<{ x: number; y: number }>) => {
  return {
    width: pts[1].x - pts[0].x,
    height: pts[3].y - pts[0].y,
  };
};

export const asMask = (idx: number, layers: any[]) => {
  const mask = layers[idx];
  const target = layers[idx + 1];
  if (mask && target && mask.td == 1 && target.tt > 0) {
    return true;
  }
  return false;
};

export const getMaskModeName = (mode: string) => {
  switch (mode) {
    case 'n':
      return '无';
    case 'a':
      return '相加';
    case 's':
      return '相减';
    case 'i':
      return '交集';
    case 'l':
      return '变亮';
    case 'd':
      return '变暗';
    case 'f':
      return '差值';
    default:
      return '未知';
  }
};

export const getMatteTypeName = (tt: number) => {
  switch (tt) {
    case 1:
      return 'Alpha 遮罩';
    case 2:
      return 'Alpha 反转遮罩';
    case 3:
      return '亮度遮罩';
    case 4:
      return '亮度反转遮罩';
    default:
      return '未知';
  }
};

export const getNodeBoundingRect = (props: {
  anchorX: number;
  anchorY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  width: number;
  height: number;
}) => {
  const $div = document.createElement('div');
  $div.style.width = `${props.width}px`;
  $div.style.height = `${props.height}px`;
  $div.style.transformOrigin = `${props.anchorX * 100}% ${props.anchorY * 100}%`;
  $div.style.transform = `scale(${props.scaleX},${props.scaleY}) rotate(${props.rotation}deg)`;
  $div.style.position = 'fixed';
  $div.style.top = '0px';
  $div.style.left = '0px';
  $div.style.visibility = 'hidden';
  document.body.appendChild($div);
  setTimeout(() => {
    document.body.removeChild($div);
  });

  return $div.getBoundingClientRect();
};

export const getTextBoundingRect = (
  containerSize: { width: number; height: number },
  textProps: { fontSize: number; text: string; height: number; color: string; font: string }
) => {
  let $svg = document.querySelector(`#${lottieSVG}`);
  if (!$svg) {
    $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    $svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    $svg.setAttribute('viewBox', `0 0 ${containerSize.width} ${containerSize.height}`);
    $svg.setAttribute('width', `${containerSize.width}`);
    $svg.setAttribute('height', `${containerSize.height}`);
    $svg.setAttribute('id', lottieSVG);
    $svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    $svg.setAttribute(
      'style',
      'position:fixed; top:0; left:0; transform: translate3d(0px, 0px, 0px); visibility:hidden;'
    );
    document.body.appendChild($svg);
  }
  $svg.innerHTML = '';

  const $g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  $g.setAttribute('fill', textProps.color);
  $g.setAttribute('font-family', textProps.font);
  $g.setAttribute('font-size', `${textProps.fontSize}`);
  $g.setAttribute('font-style', 'normal');
  $g.setAttribute('font-weight', 'normal');
  $g.setAttribute('opacity', '1');
  $g.setAttribute('display', 'block');
  $svg.appendChild($g);

  const $text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  $text.setAttribute('text-anchor', 'start');
  $text.setAttribute('letter-spacing', '0');
  $g.appendChild($text);

  const texts = textProps.text.split('\r\n');
  const lineHeight = textProps.height / texts.length;
  texts.forEach((text, idx) => {
    const $tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    $tspan.setAttribute('x', '0');
    $tspan.setAttribute('y', `${lineHeight * idx}`);
    $tspan.textContent = text;
    $text.appendChild($tspan);
  });

  return $g.getBoundingClientRect();
};

export const getLeftTopPosition = (anchor: number[], position: number[]) => {
  return [position[0] - anchor[0], position[1] - anchor[1]];
};

export const getEase = (ki: any, ko: any) => {
  return {
    x1: ko.x[0] ?? ko.x,
    y1: ko.y[0] ?? ko.y,
    x2: ki.x[0] ?? ki.x,
    y2: ki.y[0] ?? ki.y,
  };
};

export const getTypeName = (ty: number) => {
  switch (ty) {
    case 0:
      return '合成';
    case 1:
      return '纯色';
    case 2:
      return '图片';
    case 3:
      return '空';
    case 4:
      return '图形';
    case 5:
      return '文字';
    case 6:
      return '音频';
    case 9:
      return '视频';
    case 13:
      return '相机';
    default:
      return '未知';
  }
};

export const getLoop = (loop?: string) => {
  const loops = loop?.split('_');
  return {
    count: Number(loops?.[0] ?? 0),
    gap: Number(loops?.[1] ?? 0),
  };
};
