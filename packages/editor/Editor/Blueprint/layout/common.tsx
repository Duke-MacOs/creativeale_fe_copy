import create from 'zustand';

const key = 'ui.settings.blueprint.sidebar';
export const useSidebar = create<{
  visible: boolean;
  toggle: () => void;
}>(set => ({
  visible: JSON.parse(localStorage.getItem(key) ?? 'true'),
  toggle: () => {
    set(({ visible }) => {
      localStorage.setItem(key, JSON.stringify(!visible));
      return { visible: !visible };
    });
  },
}));
