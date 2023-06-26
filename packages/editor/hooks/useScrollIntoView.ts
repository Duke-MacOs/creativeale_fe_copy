import { useEffect, useRef } from 'react';

export const useScrollIntoView = <T extends HTMLElement = HTMLDivElement>(shouldScroll: boolean) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (shouldScroll) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [shouldScroll]);
  return ref;
};
