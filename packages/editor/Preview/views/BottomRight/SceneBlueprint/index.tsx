import { useEventBus } from '@byted/hooks';
import { useEditorHotkeys } from '@editor/aStore';
import { getScene, onMacOS } from '@editor/utils';
import { Badge, Button, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import { omit } from 'lodash';
import { memo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { style } from '../CanvasScale';

export default memo(SceneBlueprint);

function SceneBlueprint() {
  useEditorHotkeys(`${onMacOS('command', 'control')}+shift+o`, () => {
    trigger({ type: 'Scene', id });
  });
  const { trigger } = useEventBus('Blueprint');
  const [id, isEmpty] = useSelector(({ project }: EditorState) => {
    const scene = getScene(project);
    const blueprintScript = scene.scripts?.find(script => script.type === 'Blueprint');
    const isEmpty = !blueprintScript || scene.props[blueprintScript.id]?.scripts?.length === 0;
    return [scene.id, isEmpty];
  }, shallowEqual);

  return (
    <div>
      <Tooltip title="场景蓝图(⇧+⌘+o)" placement="bottom">
        <Button
          type={isEmpty ? 'default' : 'primary'}
          style={{
            ...omit(style, !isEmpty ? ['background'] : []),
          }}
          onClick={() => {
            trigger({ type: 'Scene', id });
          }}
        >
          <Badge dot color="red">
            <span className={cx(!isEmpty && css({ color: '#fff' }))}>场景蓝图</span>
          </Badge>
        </Button>
      </Tooltip>
    </div>
  );
}
