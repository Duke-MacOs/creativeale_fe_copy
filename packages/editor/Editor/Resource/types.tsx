import { NodeType } from '@byted/riko';

/* eslint-disable @typescript-eslint/naming-convention */
export interface ResourceEntry {
  id: number | string;
  name: string;
  category: NodeType;
  cover: string;
  url: string;
  description?: string;
  extra?: Record<string, unknown>;
  props?: Record<string, unknown>;
}
