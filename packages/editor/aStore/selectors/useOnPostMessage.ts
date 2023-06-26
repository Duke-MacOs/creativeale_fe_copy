import { useEffect, useRef } from 'react';

export function useOnPostMessage(eventName: 'ProjectState', listener: () => any): void;
export function useOnPostMessage(eventName: string, listener: any): any {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const { type } = JSON.parse(event.data);
        if (type === eventName) {
          (event.source as Window).postMessage(JSON.stringify({ type, data: listenerRef.current() }), event.origin);
        }
      } catch ({ message }) {}
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [eventName, listenerRef]);
}
