export enum EntryKey {
  SELECTED_SCENE_ID = 'editor.selected_scene_id',
  COMPONENT_WARNING = 'editor.component_warning',
  DEBUG_FLAGS = 'editor.debug_flags',
  TOOLBAR = 'editor.toolbar',
  BLUEPRINT = 'editor.blueprint',
}

export const createEntry = <T = string>(
  key: `editor.${string}`,
  getter: (value: string | null) => T,
  setter: (value: T) => string,
  disableCache = false
) => {
  let value = getter(localStorage.getItem(key));
  return {
    getValue(): T {
      return disableCache ? getter(localStorage.getItem(key)) : value;
    },
    setValue(newValue: T) {
      localStorage.setItem(key, setter((value = newValue)));
    },
  };
};

export const selectedSceneId = createEntry(EntryKey.SELECTED_SCENE_ID, Number, String);

export const debugFlags = createEntry(
  EntryKey.DEBUG_FLAGS,
  value => {
    const flags = parseInt(value || '0', 2) || 0;
    if (location.search.includes('debug=true') || process.env.MODE === 'development') {
      return flags | 1;
    }
    return (flags | 1) - 1;
  },
  flags => flags.toString(2)
);
