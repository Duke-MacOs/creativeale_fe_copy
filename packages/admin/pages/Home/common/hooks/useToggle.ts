import { useCallback, useState } from 'react';

export const useToggle = (initialState = false): [boolean, () => void, () => void] => {
  const [state, setState] = useState<boolean>(initialState);
  const toggleTrue = useCallback(() => {
    setState(true);
  }, []);
  const toggleFalse = useCallback(() => {
    setState(false);
  }, []);
  return [state, toggleTrue, toggleFalse];
};
