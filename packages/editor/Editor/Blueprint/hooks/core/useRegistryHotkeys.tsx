import { useBlueprintHotkeys } from '@editor/aStore';
import { onMacOS } from '@editor/utils';

export function useRegistryHotkeys({ dispatchAction, onCopy, onPaste, onSelectAll }: any) {
  useBlueprintHotkeys(`${onMacOS('command', 'control')}+c`, () => onCopy(), undefined, [onCopy]);

  useBlueprintHotkeys(`${onMacOS('command', 'control')}+v`, () => onPaste(), undefined, [onPaste]);

  useBlueprintHotkeys(
    `${onMacOS('command', 'control')}+x`,
    () => {
      onCopy({ remove: true });
    },
    undefined,
    [onCopy]
  );

  useBlueprintHotkeys(`${onMacOS('command', 'control')}+z`, () => {
    dispatchAction('undo');
  });

  useBlueprintHotkeys(`${onMacOS('command', 'control')}+shift+z`, () => {
    dispatchAction('redo');
  });

  useBlueprintHotkeys(`${onMacOS('command', 'control')}+a`, () => {
    onSelectAll();
  });
}
