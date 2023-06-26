import { EyeOutlined } from '@ant-design/icons';
import { IProps, playScript } from '@editor/aStore';
import { Spark } from '@editor/Editor/Property/cells';
import { getScene, getSelectedIds, findById } from '@editor/utils';
import { Tooltip, Button } from 'antd';
import { isEqual } from 'lodash';
import { useRef, useEffect, useCallback } from 'react';
import { useStore } from 'react-redux';
import { fromProps } from '../..';

export function playScriptSpark(): Spark {
  return {
    spark: 'element',
    content: () => {
      const { dispatch, getState, subscribe } = useStore<EditorState>();

      const ref = useRef<IProps | null>(null);
      useEffect(() => {
        let timer: NodeJS.Timeout;
        const unsubscribe = subscribe(() => {
          const {
            editor: { selected, stateId },
            props: p,
          } = getScene(getState().project);
          const { nodeIds } = getSelectedIds(selected);
          const props = fromProps(stateId, p)[nodeIds[0]];
          if (!isEqual(ref.current, props)) {
            ref.current = props;
            clearTimeout(timer);
            timer = setTimeout(() => {
              onClick();
            }, 600);
          }
        });

        return () => {
          unsubscribe();
          clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const onClick = useCallback(() => {
        const {
          nodes,
          editor: { selected },
        } = getScene(getState().project, undefined, false);
        const { nodeIds } = getSelectedIds(selected);
        const scriptId = findById(nodes, nodeIds[0] as number)?.[0]?.scripts?.find(
          script => script.type === 'Controller'
        )?.id;
        dispatch(playScript({ scriptId }));
      }, [dispatch, getState]);
      return (
        <Tooltip title="预览效果">
          <Button block onClick={onClick} icon={<EyeOutlined />}>
            预览
          </Button>
        </Tooltip>
      );
    },
  };
}
