import { useCallback, useEffect, useState } from 'react';

const setters: Array<(map: (flag: number) => number) => void> = [];

const pipeline = (visibleValue: number, setVisibleValue: (typeof setters)[number]) => {
  if (visibleValue === 1 || visibleValue === -1) {
    if (setters.includes(setVisibleValue)) {
      return setters[0] === setVisibleValue;
    }
    return setters.push(setVisibleValue) === 1;
  }
  return visibleValue !== 0;
};

type Options = { nextValue?: string; before?: number; threshold?: number; byStep?: boolean; disabled?: boolean };

export const useVisible = (
  key: string,
  { nextValue, threshold, before, byStep = true, disabled = false }: Options = {}
) => {
  const [visibleValue, setVisibleValue] = useState(() => {
    const value = localStorage.getItem(`editor.popup.${key}`) || sessionStorage.getItem(`editor.popup.${key}`);
    if (!value) {
      return 1;
    }
    if (nextValue) {
      return value === nextValue ? 0 : 1;
    }
    const time = Number(value);
    if (before && time < before) {
      return 1;
    }
    if (threshold && Date.now() - time > threshold) {
      return 1;
    }
    return 0;
  });
  useEffect(
    () => () => {
      const index = setters.indexOf(setVisibleValue);
      if (index > -1) {
        setters.splice(index, 1);
        if (index === 0) {
          setters[0]?.(value => -value);
        }
      }
    },
    [key]
  );
  return [
    !disabled && (byStep ? pipeline(visibleValue, setVisibleValue) : visibleValue !== 0),
    useCallback(
      (visible: boolean, remember = true) => {
        if (visible) {
          setVisibleValue(2);
        } else {
          if (remember) {
            localStorage.setItem(`editor.popup.${key}`, nextValue ?? String(Date.now()));
          } else {
            sessionStorage.setItem(`editor.popup.${key}`, nextValue ?? String(Date.now()));
          }
          if (setters[0] === setVisibleValue) {
            setters.shift();
            setters[0]?.(flag => -flag);
          }
          setVisibleValue(0);
        }
      },
      [key, nextValue]
    ),
  ] as const;
};

export const useRememberVisible = (key: string, options?: Options) => {
  const [visible, set] = useVisible(key, options);
  const [remember, setRemember] = useState(false);
  const setVisible = useCallback(
    (value: boolean) => {
      set(value, remember);
    },
    [remember, set]
  );
  return {
    setRemember,
    setVisible,
    remember,
    visible,
  };
};
