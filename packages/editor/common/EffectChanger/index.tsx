import EffectList, { EffectListProps } from './EffectList';
import withDraggableModal from '../withDraggableModal';
import { IScriptData } from '@byted/riko';
import { collectEvent, EventTypes, newID } from '../../utils';
import { isNil } from 'lodash';

export { useEffectIcon } from './EffectList';

export interface EffectChangerProps {
  title?: string;
  __script?: [string?, string?];
  onClose: () => void;
  onChange(script: Pick<IScriptData, 'id' | 'props' | 'type'>): void;
}

const EffectChanger = (props: EffectListProps) => {
  return <EffectList {...props} />;
};

const DraggingModal = withDraggableModal(EffectChanger, '添加动画', 410, 'EffectChanger');

const withEffectChangerCreator = (slot?: HTMLElement) => {
  let pos: { top?: number; left?: number; bottom?: number; right?: number } = { bottom: 100, right: 40 };
  if (!isNil(slot)) {
    const rect = slot.getBoundingClientRect();
    pos = { top: rect.top + 4, left: rect.left - 400 - 4 };
  }

  return ({ title, __script, onChange, onClose }: EffectChangerProps) => {
    return (
      <DraggingModal
        title={title}
        __script={__script}
        defaultPos={pos}
        defaultHeight={576}
        onClose={onClose}
        onClick={props => {
          collectEvent(EventTypes.AnimationType, {
            name: props.name!,
          });
          const id = newID();
          onChange({ id, props, type: 'Effect' });
          onClose();
        }}
      />
    );
  };
};

export default withEffectChangerCreator;
