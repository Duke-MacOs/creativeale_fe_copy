export interface IFigmaState {
  root: string;
  documentName: string;
  dict: Record<string, Omit<IFigmaNode, 'children'> & { children?: string[] }>;
}

export interface IFigmaNode {
  id: string;
  name: string;
  type: 'DOCUMENT' | 'CANVAS' | 'FRAME' | 'GROUP' | 'RECTANGLE' | 'ELLIPSE' | 'REGULAR_POLYGON' | 'TEXT';
  visible?: boolean;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  opacity?: number;
  characters?: string;
  style?: {
    italic?: boolean;
    fontSize: number;
    fontWeight: number;
    textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM';
    textAlignHorizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'JUSTIFIED';
    lineHeightPx: number;
  };
  fills?: Array<{
    color: { r: number; g: number; b: number; a: number };
  }>;
  isMask?: boolean;
  children?: IFigmaNode[];
}

export interface IFigmaParams {
  fileKey: string;
  accessToken: string;
}
