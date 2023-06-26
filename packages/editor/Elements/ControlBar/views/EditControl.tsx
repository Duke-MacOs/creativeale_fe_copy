import { memo, useEffect, useState } from 'react';
import { useStore } from 'react-redux';
import { Tooltip, Button } from 'antd';
import Icon, {
  LockOutlined,
  EyeOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import {
  useOnArrowKeys,
  useOnCopy,
  useOnDelete,
  useOnSelectAll,
  useNodesEditor,
  useOnMask,
  useEditorHotkeys,
  changeProps,
  useSettings,
} from '@editor/aStore';
import { StoryBoard, isLoopVideoType } from '@editor/type4';
import { getScene, onMacOS } from '@editor/utils';
import NodeAdder, { usePaste } from './NodeAdder';
import { RightBranch } from '@icon-park/react';
import { ActionFlag } from '@byted/riko';
import { CNP } from '..';

const useTypeOfPlay = (typeOfPlay?: number) => {
  const { subscribe, getState, dispatch } = useStore();
  useEffect(() => {
    if (typeOfPlay === 4) {
      return subscribe(() => {
        const scene = getScene(getState().project);
        for (const [id, { type, jumpSceneId, soundUrl }] of Object.entries(scene.props)) {
          if (type === 'PVVideo') {
            if (isLoopVideoType(scene.props)) {
              if (jumpSceneId) {
                dispatch(changeProps([Number(id)], { jumpSceneId: 0 }, { flag: ActionFlag.SideEffect }));
              }
            } else if (soundUrl) {
              dispatch(changeProps([Number(id)], { soundUrl: '' }, { flag: ActionFlag.SideEffect }));
            }
          }
        }
      });
    }
  }, [dispatch, getState, subscribe, typeOfPlay]);
};

const useStoryboardVisible = () => {
  const result = useState(() => location.search.includes('storyboard=1'));
  const [storyBoardVisible] = result;
  useEffect(() => {
    const url = new URL(location.href);
    if (storyBoardVisible) {
      url.searchParams.set('storyboard', '1');
    } else {
      url.searchParams.delete('storyboard');
    }
    history.replaceState(undefined, '', url.href);
  }, [storyBoardVisible]);
  return result;
};

const EditControl = () => {
  const [storyBoardVisible, setStoryBoardVisible] = useStoryboardVisible();
  const { hiddenStatus, lockedStatus, onChange } = useNodesEditor();
  const [uploading, setUploading] = useState(false);
  const { canDelete, onDelete } = useOnDelete();
  const onArrowKeys = useOnArrowKeys();
  const onSelectAll = useOnSelectAll();
  const { onCopy } = useOnCopy();
  const { onMask } = useOnMask();

  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  useTypeOfPlay(typeOfPlay);
  usePaste(setUploading);
  useEditorHotkeys('delete,backspace', () => onDelete());
  useEditorHotkeys(`${onMacOS('command', 'control')}+a`, () => {
    onSelectAll();
  });
  useEditorHotkeys(`${onMacOS('command', 'control')}+c`, () => onCopy());
  useEditorHotkeys(`${onMacOS('command', 'control')}+x`, () => onCopy(true));
  useEditorHotkeys(`${onMacOS('command', 'control')}+m`, event => {
    event.preventDefault();
    onMask();
  });
  useEditorHotkeys(
    ['up', 'down', 'left', 'right'].map(key => [`shift+${key}`, key].join(',')).join(','),
    event => {
      event.preventDefault();
      onArrowKeys(event);
    },
    undefined,
    [onArrowKeys]
  );

  return (
    <div className={`${CNP}-edit`} style={{ flex: isVRVideo ? '0 1 auto' : '' }}>
      <div className={`${CNP}-icons`}>
        {typeOfPlay === 4 ? (
          <Button
            ghost
            type="primary"
            loading={uploading}
            icon={<Icon component={RightBranch as any} />}
            onClick={() => setStoryBoardVisible(true)}
          >
            故事板
          </Button>
        ) : isVRVideo ? null : (
          <NodeAdder uploading={uploading} setUploading={setUploading} />
        )}
      </div>
      <div style={{ flex: 'auto' }} />
      <div className={`${CNP}-icons`}>
        <Tooltip title="删除" trigger="hover">
          <Button type="text" title="删除" icon={<DeleteOutlined />} disabled={!canDelete} onClick={() => onDelete()} />
        </Tooltip>
        {hiddenStatus ? (
          <Tooltip title="显示">
            <Button
              type="text"
              title="显示"
              icon={<EyeInvisibleOutlined />}
              onClick={() => onChange({ isHidden: false })}
            />
          </Tooltip>
        ) : (
          <Tooltip title="临时隐藏">
            <Button
              type="text"
              title="临时隐藏"
              icon={<EyeOutlined />}
              disabled={hiddenStatus === undefined}
              onClick={() => onChange({ isHidden: true })}
            />
          </Tooltip>
        )}
        {lockedStatus ? (
          <Tooltip title="解锁">
            <Button type="text" title="解锁" icon={<LockOutlined />} onClick={() => onChange({ isLocked: false })} />
          </Tooltip>
        ) : (
          <Tooltip title="锁定">
            <Button
              type="text"
              title="锁定"
              icon={<UnlockOutlined />}
              disabled={lockedStatus === undefined}
              onClick={() => onChange({ isLocked: true })}
            />
          </Tooltip>
        )}
      </div>
      {storyBoardVisible && <StoryBoard onClose={() => setStoryBoardVisible(false)} />}
    </div>
  );
};
export default memo(EditControl);
