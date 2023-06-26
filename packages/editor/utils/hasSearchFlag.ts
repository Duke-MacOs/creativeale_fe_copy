export function hasSearchFlag(key: 'componentRoot', value: '1' /** 外网显示组件根节点 */): boolean;
export function hasSearchFlag(key: 'script', value: 'DownloadApp' /** 继续使用已废弃的“下载APP” */): boolean;
export function hasSearchFlag(key: string, value: any): boolean {
  return location.search.includes(`${key}=${value}`);
}
