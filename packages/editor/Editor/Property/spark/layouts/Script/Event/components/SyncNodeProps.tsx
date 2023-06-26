import { useSelected } from '@editor/aStore';
import { getScene } from '@editor/utils';
import { useStore } from 'react-redux';
import { Button } from 'antd';

export function SyncNodeProps({ onChange }: any) {
  const { getState } = useStore<EditorState, EditorAction>();
  const {
    selected: { nodeIds },
  } = useSelected(0);
  return (
    <Button
      block
      disabled={nodeIds.length !== 1}
      onClick={() => {
        const { props } = getScene(getState().project);
        const { width, height } = props[nodeIds[0]];
        onChange({ width, height });
      }}
    >
      同步节点尺寸
    </Button>
  );
}
