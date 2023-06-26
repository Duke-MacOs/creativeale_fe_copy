import { INodeData, NodeType } from '@byted/riko';
import { newID } from '@editor/utils';
import { IFigmaState } from '../types';

function formatNodeType(figmaType: string, name: string, byGroup: boolean): NodeType {
  if (figmaType === 'FRAME' || (figmaType === 'GROUP' && (!byGroup || name.startsWith('$$')))) {
    return 'Container';
  }
  if (figmaType === 'TEXT') {
    return 'Text';
  }
  return 'Sprite';
}

function convertColor(colorData: { r: number; g: number; b: number; a: number }) {
  const color = {
    r: Math.floor(colorData.r * 255),
    g: Math.floor(colorData.g * 255),
    b: Math.floor(colorData.b * 255),
    a: Math.floor(colorData.a * 255),
  };
  return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

export async function toNodeState(
  figmaNodeId: string,
  state: IFigmaState,
  byGroup: boolean,
  origin: { x: number; y: number },
  imageTaskQueue: Array<Record<string, unknown>>
) {
  const {
    name,
    type,
    absoluteBoundingBox: rect,
    opacity,
    characters,
    style,
    visible,
    fills,
    isMask,
    children,
  } = state['dict'][figmaNodeId];
  if (visible === false) {
    return null;
  }

  const nodeType = formatNodeType(type, name, byGroup);

  const node: INodeData = {
    editor: {},
    id: newID(),
    type: nodeType,
    props: {
      name: name.startsWith('$$') ? name.slice(2) : name,
      width: rect?.width || 100,
      height: rect?.height || 100,
      x: rect ? rect?.x - origin.x : 0,
      y: rect ? rect?.y - origin.y : 0,
      alpha: opacity?.toFixed(2) || 1,
      anchorX: 0.5,
      anchorY: 0.5,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    },
    nodes: [],
    scripts: [],
  } as INodeData;

  if (nodeType === 'Sprite' && node.props) {
    node.props.url = '';
    node.props._$figmaNodeId = figmaNodeId;
    imageTaskQueue.push(node.props);
    if (isMask) {
      node.props.asMask = true;
    }
  }
  if (nodeType === 'Text' && node.props) {
    const color = fills?.find(i => i.color)?.color;
    node.props.text = characters || '';
    node.props.fontSize = style?.fontSize || 14;
    node.props.bold = (style?.fontWeight || 400) >= 700;
    node.props.align = style?.textAlignHorizontal === 'JUSTIFIED' ? 'left' : style?.textAlignHorizontal.toLowerCase();
    node.props.valign = style?.textAlignVertical === 'CENTER' ? 'middle' : style?.textAlignVertical.toLowerCase();
    node.props.color = color ? convertColor(color) : 'rgba(0,0,0,1)';
    node.props.wordWrap = true;
  }

  if (children && !(type === 'GROUP' && byGroup && !name.startsWith('$$'))) {
    for (let i = 0; i < children.length; i++) {
      const childNode = await toNodeState(
        children[i],
        state,
        byGroup,
        { x: rect?.x || 0, y: rect?.y || 0 },
        imageTaskQueue
      );
      if (childNode) {
        node.nodes?.push(childNode);
      }
    }
  }

  return node;
}
