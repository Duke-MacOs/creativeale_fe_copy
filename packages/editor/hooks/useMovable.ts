import { useState, useEffect, useCallback, useRef } from 'react';

const dummyOnChange = (_: number): void => undefined;

const useStorage = (storage: string) => {
  if (!storage) {
    return useState(0);
  }
  const model = useState(() => Number(localStorage.getItem(storage)));
  localStorage.setItem(storage, String(model[0]));
  return model;
};

export const useMovable = (
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER,
  { reserved = false, vertical = false, current = false, storage = '', onChange = dummyOnChange } = {}
) => {
  const [accumulative, setAccumulative] = useStorage(storage);
  const [activated, setActivated] = useState(false);
  const callbackRef = useRef<undefined | ((distance: number) => void)>(undefined);
  const client = useRef({ clientX: 0, clientY: 0 });
  useEffect(() => {
    if (activated) {
      let maxDistance = 0;
      const deactivate = () => {
        setActivated(false);
        callbackRef.current?.(maxDistance);
        callbackRef.current = undefined;
      };
      const listeners = {
        mouseleave: deactivate,
        mouseup: deactivate,
        mousemove({ clientY, clientX }: MouseEvent) {
          // document.body.style.pointerEvents = 'none';
          const movement = vertical ? clientY - client.current.clientY : clientX - client.current.clientX;
          client.current = { clientX, clientY };
          maxDistance = Math.max(maxDistance, Math.abs(movement));
          setAccumulative(accumulative => {
            onChange(accumulative + movement);
            return accumulative + movement;
          });
        },
      };
      for (const [event, listener] of Object.entries(listeners)) {
        document.addEventListener(event as keyof typeof listeners, listener as any);
      }
      return () => {
        // document.body.style.pointerEvents = 'auto';
        for (const [event, listener] of Object.entries(listeners)) {
          document.removeEventListener(event as keyof typeof listeners, listener as any);
        }
      };
    } else if (reserved) {
      setAccumulative(accumulative => Math.max(Math.min(accumulative, max), min));
    } else {
      setAccumulative(0);
    }
    // NOTE: Make sure not to include any dynamic deps, such as accumulative.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activated, max, min, reserved, vertical]);
  return {
    accumulative: Math.max(Math.min(accumulative, max), min),
    activated,
    activate: useCallback(
      (
        { button, target, currentTarget, clientX, clientY }: React.MouseEvent,
        callback?: (distance: number) => void
      ) => {
        if (button === 0 && (!current || target === currentTarget)) {
          setActivated(true);
          callbackRef.current = callback;
          client.current = { clientX, clientY };
        } else {
          callback?.(0);
        }
      },
      [current]
    ),
  };
};
