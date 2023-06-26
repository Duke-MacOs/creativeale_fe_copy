import { ITabState } from '@webIde/store';

class TabManager {
  protected dict: Record<ITabState['id'], ITabState> = {};

  getAllTabs() {
    return this.dict;
  }
  getTab(tabId: ITabState['id']) {
    return this.dict[tabId];
  }
  setTabs(tabs: Record<ITabState['id'], ITabState>) {
    this.dict = tabs;
  }
}

export default new TabManager();
