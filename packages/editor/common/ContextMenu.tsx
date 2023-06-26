import { isMacOS, onMacOS } from '@editor/utils';
import { Dropdown, Menu } from 'antd';
import { useEffect } from 'react';
import {
  useOnIntoComponent,
  useOnEditComponent,
  useCanAddScripts,
  useOnPutBottom,
  useNodesEditor,
  useGrouping,
  useOnDelete,
  useEmitter,
  useOnPaste,
  useOnCopy,
  useEditor,
  useOnMask,
  useOnIntoButton,
  useEditorHotkeys,
  useSettings,
} from '@editor/aStore';
import { useOnIntoParticle3D, useOnEditParticle3D } from '@editor/Resource/entries/3d/Particle3D/hooks';
import { useOnEditModel, useOnIntoModel } from '@editor/Resource/entries/3d/Model/hooks';
import { useOnIntoPanorama, useOnEditPanorama } from '@editor/Template/Panorama/hooks';

export default function ContextMenu() {
  const { edit3d } = useEditor('edit3d');
  const { contextMenu, onChange: onHide } = useEditor(0, 'contextMenu');
  const { canJoinGroup, canSplitGroup, onJoinGroup, onSplitGroup } = useGrouping();
  const { canPutBottom, canPutTop, onPutBottom, onPutTop } = useOnPutBottom();
  const { canIntoModel, modelUrl } = useOnIntoModel();
  const { canIntoParticle3D, particle3DUrl } = useOnIntoParticle3D();
  const { canIntoPanorama, nodeComponentUrl, panoramaSpaceId } = useOnIntoPanorama();
  const { onEditPanorama } = useOnEditPanorama();
  const { onEditParticle3D } = useOnEditParticle3D();
  const { onEditModel } = useOnEditModel();
  const { canIntoComponent, onIntoComponent } = useOnIntoComponent();
  const { canIntoButton, onIntoButton } = useOnIntoButton();
  const { hiddenStatus, lockedStatus, onChange } = useNodesEditor();
  const { canAddEffect, canAddScript } = useCanAddScripts();
  const { onEditComponent } = useOnEditComponent();
  const { asMask, disabled, canApplyMask, onMask } = useOnMask();
  const { canPasteNodes, onPaste } = useOnPaste();
  const { canDelete, onDelete } = useOnDelete();
  const { canCopy, onCopy } = useOnCopy();
  const onEmit = useEmitter('AddScripts');
  const menuDisabled = canDelete !== 2 && !canPasteNodes();

  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  useEditorHotkeys(`${onMacOS('command', 'control')}+[`, event => {
    event.preventDefault();
    onPutTop(true);
  });
  useEditorHotkeys(`${onMacOS('command', 'control')}+alt+[`, event => {
    event.preventDefault();
    onPutTop();
  });
  useEditorHotkeys(`${onMacOS('command', 'control')}+]`, event => {
    event.preventDefault();
    onPutBottom(true);
  });
  useEditorHotkeys(`${onMacOS('command', 'control')}+alt+]`, event => {
    event.preventDefault();
    onPutBottom();
  });

  useEffect(() => {
    if (contextMenu && menuDisabled) {
      onHide(undefined);
    }
  }, [contextMenu, menuDisabled, onHide]);

  if (!contextMenu || menuDisabled) {
    return null;
  }

  const { x, y } = contextMenu;
  let keyValue = 0;
  const menu =
    canDelete !== 2 ? (
      <Menu onClick={() => onHide(undefined)} style={{ width: '180px' }}>
        <Menu.Item key={keyValue++} disabled={!canPasteNodes()} onClick={() => onPaste()}>
          粘贴<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + V</span>
        </Menu.Item>
      </Menu>
    ) : (
      <Menu onClick={() => onHide(undefined)} style={{ width: '180px' }}>
        {typeOfPlay !== 4 && !isVRVideo && (
          <Menu.Item key={keyValue++} disabled={!canAddEffect} onClick={() => onEmit(false)}>
            添加动画
          </Menu.Item>
        )}
        {typeOfPlay !== 4 && !isVRVideo && (
          <Menu.Item key={keyValue++} disabled={!canAddScript} onClick={() => onEmit(true)}>
            添加事件
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item key={keyValue++} disabled={!canCopy} onClick={() => onCopy()}>
          复制<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + C</span>
        </Menu.Item>
        <Menu.Item key={keyValue++} disabled={!canCopy || canDelete !== 2} onClick={() => onCopy(true)}>
          剪切<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + X</span>
        </Menu.Item>
        <Menu.Item key={keyValue++} disabled={!canPasteNodes()} onClick={() => onPaste()}>
          粘贴<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + V</span>
        </Menu.Item>
        <Menu.Item key={keyValue++} disabled={canDelete !== 2} onClick={() => onDelete()}>
          删除<span style={{ float: 'right' }}>Delete</span>
        </Menu.Item>
        <Menu.Divider />
        {!edit3d && typeOfPlay !== 4 && !isVRVideo && (
          <>
            <Menu.Item key={keyValue++} disabled={disabled} onClick={onMask}>
              {canApplyMask ? '应用蒙版' : asMask ? '取消蒙版' : '作为蒙版'}
              <span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + M</span>
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        {canIntoComponent.can === 'into' && typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} onClick={onIntoComponent}>
            转为互动组件
          </Menu.Item>
        ) : canIntoComponent.can === 'edit' && typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} onClick={() => onEditComponent(canIntoComponent.url)}>
            编辑互动组件
          </Menu.Item>
        ) : canIntoComponent.can === 'view' && typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} onClick={() => onEditComponent(canIntoComponent.url)}>
            查看互动组件
          </Menu.Item>
        ) : null}
        {canIntoButton && (
          <Menu.Item key={keyValue++} onClick={onIntoButton}>
            一键转为按钮
          </Menu.Item>
        )}
        {canIntoModel !== 'None' && (
          <Menu.Item key={keyValue++} onClick={() => onEditModel(modelUrl)}>
            {canIntoModel === 'view' && '查看'}
            {canIntoModel === 'edit' && '编辑'}
            模型
          </Menu.Item>
        )}
        {canIntoParticle3D && (
          <Menu.Item key={keyValue++} onClick={() => onEditParticle3D(particle3DUrl)}>
            编辑粒子
          </Menu.Item>
        )}
        {canIntoPanorama && (
          <Menu.Item key={keyValue++} onClick={() => onEditPanorama(nodeComponentUrl, panoramaSpaceId)}>
            编辑全景
          </Menu.Item>
        )}
        {typeOfPlay !== 4 && !isVRVideo && (
          <Menu.SubMenu key="subMenu" title="移动层级">
            <Menu.Item key={keyValue++} disabled={!canPutTop} onClick={() => onPutTop(false)}>
              置顶&nbsp;&nbsp;
              <span style={{ float: 'right' }}>
                {isMacOS ? 'Opt' : 'Alt'} + {isMacOS ? 'Cmd' : 'Ctrl'} + [
              </span>
            </Menu.Item>
            <Menu.Item key={keyValue++} disabled={!canPutTop} onClick={() => onPutTop(true)}>
              上移&nbsp;&nbsp;<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + [</span>
            </Menu.Item>
            <Menu.Item key={keyValue++} disabled={!canPutBottom} onClick={() => onPutBottom(true)}>
              下移&nbsp;&nbsp;<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + ]</span>
            </Menu.Item>
            <Menu.Item key={keyValue++} disabled={!canPutBottom} onClick={() => onPutBottom(false)}>
              置底&nbsp;&nbsp;
              <span style={{ float: 'right' }}>
                {isMacOS ? 'Opt' : 'Alt'} + {isMacOS ? 'Cmd' : 'Ctrl'} + ]
              </span>
            </Menu.Item>
          </Menu.SubMenu>
        )}
        {canSplitGroup && typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} onClick={onSplitGroup}>
            打散<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + G</span>
          </Menu.Item>
        ) : canJoinGroup && typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} onClick={onJoinGroup}>
            组合<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + G</span>
          </Menu.Item>
        ) : typeOfPlay !== 4 && !isVRVideo ? (
          <Menu.Item key={keyValue++} disabled onClick={onSplitGroup}>
            组合/打散<span style={{ float: 'right' }}>{isMacOS ? 'Cmd' : 'Ctrl'} + G</span>
          </Menu.Item>
        ) : null}
        <Menu.Divider />
        <Menu.Item key={keyValue++} onClick={() => onChange({ isHidden: !hiddenStatus })}>
          {hiddenStatus ? '显示' : '临时隐藏'}
        </Menu.Item>
        <Menu.Item key={keyValue++} onClick={() => onChange({ isLocked: !lockedStatus })}>
          {lockedStatus ? '解锁' : '锁定'}
        </Menu.Item>
      </Menu>
    );
  return (
    <Dropdown
      key={`${x}:${y}`}
      overlay={menu}
      open={true}
      trigger={['contextMenu']}
      onOpenChange={visible => {
        if (!visible) {
          onHide(undefined);
        }
      }}
    >
      <div
        style={{
          position: 'fixed',
          left: Math.abs(x),
          top: Math.abs(y),
          width: 1,
          height: 1,
          zIndex: 999,
        }}
      />
    </Dropdown>
  );
}
