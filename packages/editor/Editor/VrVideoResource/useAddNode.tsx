import { useAddNode } from '@editor/aStore';
import { ResourceEntry } from './types';
import { useDrag } from 'react-dnd';
import { message } from 'antd';
import { centerNode } from '@editor/utils';

const tryMessage = (fn: () => any): typeof fn => {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      message.error(error.message);
    }
  };
};

export default ({ category, url, name, cover, extra, props }: ResourceEntry) => {
  const onAddNode = useAddNode();
  const [, drag] = useDrag({
    item: { type: 'resource', mime: category, url, name, cover, props },
  });
  return {
    ref: drag,
    onClick: tryMessage(async () => {
      if (category === 'PVSlider') {
        const node = await new Promise<RikoNode>((resolve, reject) => {
          let rikoNode: RikoNode;
          onAddNode(
            {
              mime: 'PVSlider',
              name: '滑条轨道',
              url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/db0847b71d6608d9e48307f0de76dd5e.png',
              mapNode(node: any) {
                node.type = 'PVSprite';
                rikoNode = node;
                return node;
              },
            },
            true
          )
            .then(() => {
              resolve(rikoNode!);
            })
            .catch(reject);
        });
        props = {
          ...props,
          x: (node.props as any).x + 4,
          y: (node.props as any).y + 4,
          distance: 428,
        };
      }
      return await onAddNode(
        {
          mime: category,
          name,
          url,
          cover,
          extra,
          mapNode(node) {
            node = { ...node, props: { ...node.props, ...props } };
            if (node.type === 'PVAlphaVideo') {
              node = centerNode(node, 720, 1280);
              node.editor = { ...node.editor, isLocked: true };
            }
            return node;
          },
        },
        true
      );
    }),
  };
};
