import { monaco } from 'react-monaco-editor';

export interface ITag {
  tagName: string;
  desc?: string;
  createAt: Date;
  projectId: number;
  sceneId: number;
  jscode: string;
  _id?: number;
}

export interface IWorkspaceState {
  projectId?: number;
  readOnly: boolean;
  loading: boolean;
  currentTab: number | null;
  resourceNav: number[];
  markers: monaco.editor.IMarkerData[];
  initialRange?: monaco.IRange;
  selectedHistoryId: number | null;
  selectedTag: ITag | null;
}

export interface ITabState {
  id: number;
  orderId: number;
  projectId: number;
  name: string;
  resourceContent?: string;
  resourceLanguage?: 'typescript' | 'javascript';
  needsSave: boolean;
  /**
   * 'normal' | 'pending'
   */
  saveStatus: 0 | 1;
}

export interface IWebIdeState {
  setting: Record<string, unknown>;
  workspace: IWorkspaceState;
  tabs: Record<ITabState['id'], ITabState>;
}
