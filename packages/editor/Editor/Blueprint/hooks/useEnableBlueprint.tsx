import { useEditor } from '@editor/aStore';

export function useEnableBlueprint() {
  const { enableBlueprint } = useEditor(0, 'enableBlueprint');
  return enableBlueprint;
}
