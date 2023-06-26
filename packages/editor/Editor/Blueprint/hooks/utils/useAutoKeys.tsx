import { useRef, useCallback } from 'react';

export function useAutoKeys() {
  const key = useRef(1);
  const newKey = useCallback(() => {
    return key.current++;
  }, []);

  return newKey;
}
