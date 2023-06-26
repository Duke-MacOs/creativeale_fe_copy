import { monaco } from 'react-monaco-editor';
import { ITabState } from '@webIde/store';

class ViewState<T extends monaco.editor.ICodeEditorViewState | null | undefined> {
  protected dict: Record<ITabState['id'], T> = {};

  get(tabId: ITabState['id']): T {
    return this.dict[tabId];
  }

  set(tabId: ITabState['id'], viewState: T): void {
    this.dict[tabId] = viewState;
  }

  has(tabId: ITabState['id']): boolean {
    return Object.keys(this.dict).includes(tabId.toString());
  }
}

export const viewState = new ViewState();
