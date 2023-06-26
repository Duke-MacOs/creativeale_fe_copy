import { useState } from 'react';
import Icon from '@ant-design/icons';
import { Plus } from '@icon-park/react';
import { useOnAddComponent, useOnAddCustomScript } from '@editor/aStore';
import { CreateTabModal } from '@webIde/Sidebar/CreateTabModal';
import { openWebIde } from '@webIde/exports';

export function ComponentAdder() {
  const onAddComponent = useOnAddComponent({ is3D: false });
  return (
    <div
      style={{
        width: '72px',
        height: '72px',
        cursor: 'pointer',
        border: '1px solid #f0f0f0',
        borderRadius: '2px',
        justifySelf: 'center',
        background: '#eef3fe',
        display: 'flex',
        justifyContent: 'center',
        color: '#3955f6',
        alignItems: 'center',
        fontSize: '1.62em',
      }}
      onClick={onAddComponent}
    >
      <Icon component={Plus as any} />
    </div>
  );
}

export function CustomScriptAdder() {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const onAddCustomScript = useOnAddCustomScript();
  return (
    <>
      <div
        style={{
          width: '72px',
          height: '72px',
          cursor: 'pointer',
          border: '1px solid #f0f0f0',
          borderRadius: '2px',
          justifySelf: 'center',
          background: '#eef3fe',
          display: 'flex',
          justifyContent: 'center',
          color: '#3955f6',
          alignItems: 'center',
          fontSize: '1.62em',
        }}
        onClick={async () => {
          setCreateModalVisible(true);
        }}
      >
        <Icon component={Plus as any} />
      </div>
      {createModalVisible && (
        <CreateTabModal
          onConfirm={async (name, language) => {
            const newName = name + (language === 'typescript' ? '.ts' : '.js');
            const { orderId, projectId } = await onAddCustomScript(newName, language as 'typescript' | 'javascript');
            setCreateModalVisible(false);
            openWebIde(projectId, orderId);
          }}
          onCancel={() => {
            setCreateModalVisible(false);
          }}
        />
      )}
    </>
  );
}
