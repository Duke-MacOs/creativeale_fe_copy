import { useCallback, useRef } from 'react';

export default () => {
  const didDrag = useRef(false);
  return {
    beginDrag: useCallback(() => {
      didDrag.current = true;
    }, []),
    didDrag: useCallback((callback: (didDrag: boolean) => void) => {
      const events = ['mouseleave', 'mouseup'];
      const listener = () => {
        callback(didDrag.current);
        for (const event of events) {
          document.removeEventListener(event, listener);
        }
      };
      for (const event of events) {
        document.addEventListener(event, listener);
      }
      didDrag.current = false;
    }, []),
  };
};
