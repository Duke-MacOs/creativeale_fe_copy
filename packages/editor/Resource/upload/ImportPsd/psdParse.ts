import { INodeData } from '@byted/riko';
import { newID } from '../../../utils';

interface IText {
  text: string;
  font: string;
  lineHeight: number;
  fontSize: number;
  color: string;
}

export interface IPSDNode {
  id: number;
  name: string;
  width: number;
  height: number;
  top: number;
  left: number;
  opacity: number;
  children: IPSDNode[];
  texts?: IText[];
  image?: string;
  blob?: Blob | null;
  isGroup?: boolean;
}

// 过滤
export function filter(psd: IPSDNode) {
  psd.children.map(item => {
    if (item.children) {
      filter(item);
    }
    item.top -= psd.top;
    item.left -= psd.left;
  });
}

export function toNodeState(psd: IPSDNode, imageTaskQueue: Array<Record<string, unknown>>) {
  const node = {
    editor: {},
    id: psd.id,
    type: psd.isGroup ? 'Container' : psd.texts ? 'Text' : 'Sprite',
    props: {
      name: psd.name,
      width: psd.width,
      height: psd.height,
      x: psd.left,
      y: psd.top,
      alpha: parseFloat((psd.opacity / 255).toFixed(2)),
      anchorX: 0.5,
      anchorY: 0.5,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    nodes: [],
    scripts: [],
  } as INodeData;

  if (node.type === 'Sprite' && node.props && psd.blob) {
    const types = psd.blob.type.split('/');
    const imageType = types[types.length - 1];
    if (['png', 'jpg', 'jpeg'].includes(imageType)) {
      const imageName = `${psd.name}.${imageType}`;
      node.props._$imageFile = new File([psd.blob], imageName);
      imageTaskQueue.push(node.props);
    }
  }
  if (node.type === 'Text' && psd.texts && node.props) {
    const text = psd.texts[0];
    node.props.text = text.text;
    node.props.fontSize = text.fontSize;
    node.props.leading = text.lineHeight;
    node.props.color = text.color;
  }

  if (psd.children) {
    for (let i = 0; i < psd.children.length; i++) {
      node.nodes?.push(toNodeState(psd.children[psd.children.length - 1 - i], imageTaskQueue)); // 倒序
    }
  }

  return node;
}

// 保存图片
async function saveImage(node: any, obj: IPSDNode, isGroup: boolean): Promise<void> {
  if (obj.width === 0 || obj.height === 0) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = obj.width;
  canvas.height = obj.height;
  const ctx = canvas.getContext('2d');

  const drawImage = (
    pngFile: HTMLImageElement,
    pos: { top: number; left: number },
    size: { width: number; height: number }
  ): Promise<void> => {
    return new Promise(resolve => {
      pngFile.onload = function () {
        if (size.width && size.height) {
          ctx?.drawImage(pngFile, pos.left, pos.top, size.width, size.height);
        }
        resolve();
      };
      pngFile.onerror = function () {
        resolve();
      };
    });
  };
  const drawChildren = (drawTasks: Array<Promise<any>>, node: any, basePos: { left: number; top: number }) => {
    const children = node._children.reverse();
    if (children) {
      for (const childNode of children) {
        if (childNode.isGroup()) {
          drawChildren(drawTasks, childNode, basePos);
        } else {
          const { top, left, width, height } = childNode;
          if (width && height) {
            const png = childNode.layer.image.toPng();
            drawTasks.push(drawImage(png, { top: top - basePos.top, left: left - basePos.left }, { width, height }));
          }
        }
      }
    }
  };

  return Promise.resolve()
    .then(() => {
      const drawTasks: Array<Promise<any>> = [];
      if (isGroup) {
        drawChildren(drawTasks, node, { left: node.left, top: node.top });
      } else {
        try {
          if (node.width && node.height) {
            const png = node.layer.image.toPng();
            drawTasks.push(drawImage(png, { top: 0, left: 0 }, { width: obj.width, height: obj.height }));
          }
        } catch (err) {}
      }
      return Promise.all(drawTasks);
    })
    .then(() => {
      return new Promise(resolve => {
        try {
          canvas.toBlob(function (blob) {
            obj.blob = blob;
            obj.image = URL.createObjectURL(blob as any);
            resolve();
          });
        } catch (err) {
          resolve();
        }
      });
    });
}

// 转 rgba
function colorToRGBA(color: number[]) {
  const r = (color[1] * 255).toFixed(0);
  const g = (color[2] * 255).toFixed(0);
  const b = (color[3] * 255).toFixed(0);
  const a = (color[0] * 255).toFixed(0);
  return `rgba(${r},${g},${b},${a})`;
}

// 解析文本图层
function _parseText(node: any, obj: IPSDNode) {
  const typeTool = node.layer.typeTool();
  const styles = typeTool.styles();
  const lineHeight = styles.Leading ? styles.Leading[0] : obj.height; // PS 设置 Leading auto 时，解析结果中并不存在该字段
  const txtItem = {
    text: typeTool.textValue,
    font: typeTool.fonts().join(),
    lineHeight,
    fontSize: styles.FontSize[0],
    color: colorToRGBA(styles.FillColor[0].Values),
  };
  obj.texts = [txtItem];

  if (lineHeight !== obj.height) {
    obj.top = obj.top - (lineHeight - obj.height) / 2;
    obj.height = lineHeight;
  }
}

// 过滤
export const parse = async function (node: any, byGroup = false) {
  const { layer } = node;
  const layerName = node.name || '';
  const json: IPSDNode = {
    name: layerName.startsWith('$$') ? layerName.slice(2) : layerName,
    width: node.width,
    height: node.height,
    top: node.top,
    left: node.left,
    id: newID(),
    opacity: layer.opacity >= 0 ? layer.opacity : 255,
    children: [],
  };
  if (node.isRoot() || (node.isGroup() && (!byGroup || node.name.startsWith('$$')))) {
    const children = node._children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const item = children[i];
        if (item.layer.visible) {
          json.children.push(await parse(item, byGroup));
        }
      }
    }
    json.isGroup = true;
  } else {
    // 文字信息解析有问题，暂不开放
    // if (layer.typeTool) {
    //   parseText(node, json);
    // }
    if (layer.image) {
      await saveImage(node, json, node.isGroup());
    }
  }
  return json;
};
