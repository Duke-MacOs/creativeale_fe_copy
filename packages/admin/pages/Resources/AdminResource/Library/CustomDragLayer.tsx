import React from 'react';
import { XYCoord, useDragLayer } from 'react-dnd';
import { css } from 'emotion';
import MaterialCover from '@shared/components/MaterialCover';
import { IUserMaterial } from '@/types/library';

const layerStyles = css({
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
});

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }
  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export const CustomDragLayer = () => {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  console.log(isDragging);
  if (!isDragging) {
    return null;
  }
  const materialItem = item.item as IUserMaterial;
  return (
    <div className={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <MaterialCover data={materialItem} />
      </div>
    </div>
  );
};
