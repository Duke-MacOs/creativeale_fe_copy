import { EyeOutlined } from '@ant-design/icons';
import { playScript } from '@editor/aStore';
import { Button } from 'antd';
import { useStore } from 'react-redux';

export function PlayScriptBtn({ id }: any) {
  const { dispatch } = useStore<EditorState, EditorAction>();

  return (
    <Button
      block
      onClick={() => {
        dispatch(playScript({ scriptId: Number(id) }));
      }}
      icon={<EyeOutlined />}
    >
      预览
    </Button>
  );
}
