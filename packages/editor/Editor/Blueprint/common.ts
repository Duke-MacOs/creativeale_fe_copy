import { neverThrow } from '@editor/utils';
import { INodeTypes } from './types';

export enum NodeColor {
  SELECTED = 'rgb(164, 160, 228)',
  DEFAULT = '#68d4aa',
  // BLUEPRINT = 'rgb(255 192 203)',
  BLUEPRINT = 'rgb(100 159 210)',
  BLOCK = 'rgb(213 122 132)',
}

export function getNodeColor(type: INodeTypes | undefined, _selected = false) {
  // if (selected) return NodeColor.SELECTED;
  if (!type) return NodeColor.DEFAULT;
  switch (type) {
    case 'root': {
      return NodeColor.BLUEPRINT;
    }

    case 'scene':
    case 'node': {
      return NodeColor.DEFAULT;
    }

    case 'block':
    case 'component': {
      return NodeColor.BLOCK;
    }

    default: {
      return neverThrow(type);
    }
  }
}
