import { useEventBus, usePersistCallback } from '@byted/hooks';
import { getCustomScriptByOrderId } from '@editor/utils';
import { message } from 'antd';
import { useMemo } from 'react';
import { Node } from 'react-flow-renderer';
import { useStore } from 'react-redux';
import { publishDynamicResource } from '../../api';

export function useOnPublish({ selectedIds, nodes }: { selectedIds: string[]; nodes: Node<RikoScript>[] }) {
  const { getState } = useStore<EditorState>();
  const { trigger: reload } = useEventBus('reloadResource');

  const canOnPublish = useMemo(() => {
    if (selectedIds.length === 1) {
      const node = nodes.find(node => node.id === selectedIds[0]);
      if (node) {
        const {
          data: {
            props: { script, url },
          },
        } = node;
        if (script === 'CustomScript' && url) {
          return true;
        }
      }
    }
    return false;
  }, [nodes, selectedIds]);
  const onPublish = usePersistCallback(async () => {
    if (canOnPublish) {
      try {
        const node = nodes.find(node => node.id === selectedIds[0]);
        const {
          data: {
            props: { name = '', url, _editor: { bpName } = {} as any },
          },
        } = node!;
        const { ideCode } = getCustomScriptByOrderId(getState().project, url);
        await publishDynamicResource({
          name: bpName || name,
          description: '',
          type: 'code',
          data: {
            code: ideCode,
            contextType: 'both',
          },
        });
        reload();
        message.success('发布成功');
      } catch (error) {
        message.error(error.message);
      }
    }
  });

  return {
    canOnPublish,
    onPublish,
  };
}
