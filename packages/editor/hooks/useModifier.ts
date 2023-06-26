import { useState, useEffect } from 'react';
import { onMacOS } from '../utils';

let modifiers = { ctrlMeta: false, shiftKey: false, altKey: false, ctrlKey: false, metaKey: false };
const setModifiers = [] as Array<(keys: typeof modifiers) => void>;
const keypress = ({ ctrlKey, metaKey, shiftKey, altKey }: KeyboardEvent) => {
  modifiers = { ctrlMeta: onMacOS(metaKey, ctrlKey), shiftKey, altKey, ctrlKey, metaKey };
  for (const setModifier of setModifiers) {
    setModifier(modifiers);
  }
};
for (const event of ['keydown', 'keyup'] as const) {
  document.addEventListener(event, keypress);
}
export const useModifier = (key: keyof typeof modifiers, callback?: (value: boolean) => void) => {
  const [value, setValue] = useState(false);
  useEffect(() => {
    const setModifier = ({ [key]: value = false }: typeof modifiers) => {
      callback?.(value);
      setValue(value);
    };
    setModifiers.push(setModifier);
    setModifier(modifiers);
    return () => {
      setModifiers.splice(setModifiers.indexOf(setModifier), 1);
    };
  }, [key, callback]);
  return value;
};
