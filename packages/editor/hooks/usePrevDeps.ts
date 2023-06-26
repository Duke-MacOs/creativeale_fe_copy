import { useMemo, useRef } from 'react';

export const usePrevDeps = <T extends any[], R>(factory: (prevDeps: T, nextDeps: T) => R, deps: T): R => {
  const prevDeps = useRef(deps);
  return useMemo(() => {
    return factory(prevDeps.current, (prevDeps.current = deps));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
