import { INodeData } from '@byted/riko';

export const centerNode = (node: INodeData, W = 750, H = 1334) => {
  const { width = 0, height = 0 } = (node.props ?? {}) as any;
  (node.scripts?.[0]?.props as any).loop = true;
  node.props = {
    ...node.props,
    fillType: 3,
    center: true,
    bottom: true,
    top: true,
  };
  if ((height * W) / width <= H) {
    const h = (height * W) / width;
    node.props = {
      ...node.props,
      width: W,
      x: 0,
      height: h,
      y: (H - h) / 2,
    };
  } else {
    const w = (width * H) / height;
    node.props = {
      ...node.props,
      height: H,
      y: 0,
      width: w,
      x: (W - w) / 2,
    };
  }
  return node;
};
