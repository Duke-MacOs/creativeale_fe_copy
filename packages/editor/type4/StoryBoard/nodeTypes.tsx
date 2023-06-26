import { Handle, NodeProps, Position } from 'react-flow-renderer';
import { PauseCircleFilled, PlayCircleFilled } from '@ant-design/icons';
import { Badge, Typography, Tooltip } from 'antd';
import { useVideoDuration } from '@editor/hooks';
import { useEffect, useState } from 'react';
import { useEventBus } from '@byted/hooks';
import { absoluteUrl } from '@shared/utils';
import { css } from 'emotion';

export const [W, H] = [108, 192];

export type NodeData = { url?: string | number; name?: string; type: string };
const selectedStyle = css({
  outline: '6px solid #fd9c04',
});

export default {
  start: ({ selected }: NodeProps<NodeData>) => {
    return (
      <div
        className={css(
          {
            textAlign: 'center',
            fontSize: 12,
            width: W + 12 * 2,
            height: H + 12 + 20,
            background: '#ffccc7',
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          },
          selected && selectedStyle
        )}
      >
        开始
        <Handle
          type="source"
          position={Position.Right}
          style={{
            height: 12,
            width: 12,
            right: -6,
          }}
        />
      </div>
    );
  },
  video: ({ data: { url = '', name = '', type = '' }, selected }: NodeProps<NodeData>) => {
    const { ref, display } = useVideoDuration(url);
    const [playing, setPlaying] = useState(false);
    useEffect(() => {
      ref.current?.addEventListener('ended', function () {
        setPlaying(false);
      });
    }, []);
    useEffect(() => {
      if (!ref.current) {
        return;
      }
      if (playing) {
        ref.current.currentTime = 0;
        ref.current.play();
      } else {
        ref.current.pause();
      }
    }, [playing]);
    const { trigger } = useEventBus('VideoPlayableVideoPlaying', setter => {
      if (setter !== setPlaying) {
        setPlaying(false);
      }
    });
    const Icon = playing ? PauseCircleFilled : PlayCircleFilled;
    const children = (
      <div
        className={css(
          {
            textAlign: 'center',
            fontSize: 12,
            padding: '12px 12px 0',
            background: '#cfebfc',
            borderRadius: 4,
            position: 'relative',
          },
          selected && selectedStyle
        )}
      >
        <video
          key={url}
          ref={ref}
          preload="metadata"
          src={absoluteUrl(url as string)}
          className={css({
            width: W,
            height: H,
            objectFit: 'contain',
            borderRadius: 4,
            background: '#fafafa',
            display: 'block',
            margin: '0 auto',
          })}
        />
        <Icon
          className={css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            color: '#333',
            transform: 'translate(-50%, -50%)',
            transition: '200ms',
            cursor: 'pointer',
            fontSize: 36,
            opacity: 0,
            '&:hover': {
              opacity: 0.62,
            },
          })}
          onClick={() => {
            if (ref.current) {
              setPlaying(!playing);
              trigger(setPlaying);
            }
          }}
        />
        <Typography.Text
          type="secondary"
          className={css({
            display: 'block',
            width: W,
            height: 20,
            lineHeight: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          })}
        >
          <Tooltip placement="bottom" title={name}>
            {name}
          </Tooltip>
        </Typography.Text>
        <Handle
          type="target"
          position={Position.Left}
          style={{
            height: 12,
            width: 12,
            left: -6,
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{
            height: 12,
            width: 12,
            right: -6,
          }}
        />
      </div>
    );
    return type ? (
      <Badge.Ribbon text={`${type} ${display}`} color="#8acbf5">
        {children}
      </Badge.Ribbon>
    ) : (
      children
    );
  },
};
