import { Options, useHotkeys } from 'react-hotkeys-hook';
import { useEditor } from '../useEditor';

export const useEditor3DHotkeys = (
  keys: string,
  callback: Parameters<typeof useHotkeys>[1],
  options?: Options,
  deps?: any[]
) => {
  const { edit3d } = useEditor('edit3d');
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  const hotKeysOptions = {
    enabled: Boolean(edit3d && !enableBlueprint),
  };
  useHotkeys(keys, callback, options || hotKeysOptions, deps);
};
