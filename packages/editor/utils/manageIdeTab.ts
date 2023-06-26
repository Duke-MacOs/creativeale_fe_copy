import indexDBUtils from '@shared/utils/indexDB';

export function getTab(tabId: string) {
  return indexDBUtils.getData('ideTabs', tabId).then((data: any) => data);
}

export function getTabContent(tabId: string) {
  return indexDBUtils.getData('ideTabs', tabId).then((data: any) => {
    const content = data ? (data.language === 'typescript' ? data.compiledContent : data.content) : null;
    return content;
  });
}
