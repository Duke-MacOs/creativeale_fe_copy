import { useEffect } from 'react';

export function useBeforeUnload() {
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      (event || window.event).returnValue = '你确定吗？';
      return '蓝图数据尚未保存，请保存后再退出';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);
}
