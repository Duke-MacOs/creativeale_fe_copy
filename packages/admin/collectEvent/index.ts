/**
 * module_name 由 path 转变而来
 * eg. /my/project -> my_project
 */
const pathToModuleName = (path: string): string => {
  return path.split('/').filter(Boolean).join('_');
};

export function collectEventTableAction(actionName: string, becon = false) {
  const collect = becon ? beconEvent : collectEvent;
  return (actionResult: 'okay' | 'error' | 'cancel', extra: any = {}) =>
    collect('table_action', {
      pathname: pathToModuleName(location.pathname),
      action_search: new URLSearchParams(location.search).toString(),
      action_result: actionResult,
      action_name: actionName,
      ...extra,
    });
}

export function collectEventTab(tabName: string) {
  collectEvent('table_switch_tab', {
    pathname: pathToModuleName(location.pathname),
    tab_name: tabName,
  });
}

export function collectEventSidebar(name: string, path: string) {
  collectEvent('sidebar_menu', {
    menu_path: `sidebar_${pathToModuleName(path)}`,
    menu_name: name,
  });
}

export function collectEventSearchParams(params: Record<string, any>) {
  collectEvent('table_search_params', {
    pathname: pathToModuleName(location.pathname),
    params: new URLSearchParams(params).toString(),
  });
}

export function collectEventSearchAction(params: Record<string, any>) {
  collectEvent('table_search_action', {
    pathname: pathToModuleName(location.pathname),
    params: new URLSearchParams(params).toString(),
  });
}

export function beconEvent(eventName: string, params: any) {
  return window.collectEvent('beconEvent', eventName, params);
}

export function collectEvent(eventName: string, params: any) {
  return window.collectEvent(eventName, params);
}
