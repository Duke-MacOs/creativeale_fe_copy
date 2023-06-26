import React, { useCallback, useEffect, useState } from 'react';
import { INodeState, useSelected, useGetSelected } from '@editor/aStore';

export default (node: INodeState, scale: number, Overlay: any) => {
  const getSelected = useGetSelected();
  const [overlay, setOverlay] = useState<React.ReactNode>(null);
  const { selected, onSelect, onSelectId } = useSelected(node.id, true, true);

  useEffect(() => {
    if (selected) {
      return () => setOverlay(null);
    }
  }, [selected, scale]);
  const onScriptContextMenu: React.MouseEventHandler<HTMLDivElement> = useCallback(({ target, currentTarget }) => {
    (target as HTMLDivElement).dataset.script = currentTarget.dataset.script;
  }, []);
  const onContextMenu: React.MouseEventHandler<HTMLDivElement> = event => {
    const rect = event.currentTarget.getBoundingClientRect();
    const {
      dataset: { script },
    } = event.target as HTMLDivElement;
    const targetScript = node.scripts.find(({ id }) => id === Number(script));
    if (targetScript && !getSelected().scriptIds.includes(targetScript.id)) {
      onSelectId(event, [targetScript.id], false, false);
    } else if (!targetScript && !selected) {
      onSelect(event);
    }
    setOverlay(
      <Overlay
        left={event.clientX - rect.left}
        top={event.clientY - rect.top}
        hideOverlay={() => setOverlay(null)}
        script={targetScript}
        scale={scale}
      />
    );
  };
  return {
    onScriptContextMenu,
    onContextMenu,
    onSelect,
    selected,
    overlay,
  };
};
