import { Options, useHotkeys } from 'react-hotkeys-hook';
import { useEditor } from '../useEditor';

export const useEditorHotkeys = (
  keys: string,
  callback: Parameters<typeof useHotkeys>[1],
  options?: Options,
  deps?: any[]
) => {
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const hotKeysOptions = {
    enabled: Boolean(!enableBlueprint),
  };
  useHotkeys(keys, callback, options || hotKeysOptions, deps || []);
};
