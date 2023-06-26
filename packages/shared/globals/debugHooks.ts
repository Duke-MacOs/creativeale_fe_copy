/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from 'react';
import { debugFlags } from './localStore';
export type FlagItem = { title: string; flagBit: number; onChange(checked: boolean): void };

let subscribers = [] as Array<(debugFlags: number, flagItems: FlagItem[]) => void>;
let flagItems = [] as FlagItem[];
let dispatching = false;

const dispatch = (debugFlags: number, flagItems: FlagItem[]) => {
  if (dispatching) {
    throw new Error('Do not addDebugFlag or setDebugFlags when dispatching');
  }
  dispatching = true;
  try {
    for (const subscriber of subscribers) {
      subscriber(debugFlags, flagItems);
    }
  } finally {
    dispatching = false;
  }
};
export const useDebugFlag = (item: Omit<FlagItem, 'onChange'>, reload = false) => {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const current = flagItems.find(({ flagBit }) => flagBit === item.flagBit);
    if (current) {
      throw new Error(`'${current.title}' has taken the flag: 0b${current.flagBit.toString(2)}`);
    } else if (item.flagBit & 1) {
      throw new Error(`You flagBit should not contain '0b1'.`);
    }
    flagItems = flagItems.concat({ ...item, onChange: reload ? () => location.reload() : setChecked });
    dispatch(debugFlags.getValue(), flagItems);
    setChecked((debugFlags.getValue() & (item.flagBit + 1)) === item.flagBit + 1);
    return () => {
      flagItems = flagItems.filter(({ flagBit }) => flagBit !== item.flagBit);
    };
  }, []);
  return checked;
};
export const useFlagItems = () => {
  const [flags, setFlags] = useState(debugFlags.getValue());
  const [items, setItems] = useState<Omit<FlagItem, 'onChange'>[]>(flagItems);
  useEffect(() => {
    const listener: (typeof subscribers)[number] = (debugFlags, flagItems) => {
      setFlags(debugFlags);
      setItems(flagItems);
    };
    subscribers = subscribers.concat(listener);
    return () => {
      subscribers = subscribers.filter(subscriber => subscriber !== listener);
    };
  }, []);
  return {
    items,
    flags,
    setFlags: useCallback((newDebugFlags: number): void => {
      const flags = debugFlags.getValue();
      if (flags & 1) {
        debugFlags.setValue(newDebugFlags);
        for (const { flagBit, onChange } of flagItems) {
          const newFlagBit = flagBit & newDebugFlags;
          if (newFlagBit !== (flagBit & flags)) {
            onChange(newFlagBit === flagBit);
          }
        }
        dispatch(newDebugFlags, flagItems);
      }
    }, []),
  };
};
export const addDebugFlag = (item: FlagItem) => {
  const current = flagItems.find(({ flagBit }) => flagBit === item.flagBit);
  if (current) {
    throw new Error(`'${current.title}' has taken the flag: 0b${current.flagBit.toString(2)}`);
  } else if (item.flagBit & 1) {
    throw new Error(`You flagBit should not contain '0b1'.`);
  }
  flagItems = flagItems.concat(item);
  dispatch(debugFlags.getValue(), flagItems);
  return [
    (debugFlags.getValue() & (item.flagBit + 1)) === item.flagBit + 1,
    () => {
      flagItems = flagItems.filter(({ flagBit }) => flagBit !== item.flagBit);
    },
  ] as const;
};
