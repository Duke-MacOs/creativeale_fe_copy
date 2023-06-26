import { absoluteUrl } from '@shared/utils';
import TypeIcon from '@editor/Elements/TimePane/Header/NodeSpan/NodeIcon';
import { useVideoDuration } from '@editor/hooks';
import { Button, theme } from 'antd';
import { css, cx } from 'emotion';
import { ResourceBoxProps } from '.';

const background = css({
  background:
    'url("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAYEBAQFBAYFBQYJBgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTExQUExMcGxsbHB8fHx8fHx8fHx8BBwcHDQwNGBAQGBoVERUaHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fH//AABEIABgAGAMBEQACEQEDEQH/xABaAAEBAQAAAAAAAAAAAAAAAAAEAAgQAAEACQUAAAAAAAAAAAAAAAAFERVDY4KiweESEzRRkQEBAAAAAAAAAAAAAAAAAAAAABEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A1SAJJO5rACAa0odWALmw9uZerzoCZsSnIAgGo15LcBoH/9k=") 0px 0px / 12px 12px repeat',
  objectFit: 'contain',
  height: '100%',
  width: '100%',
});

export interface CoverProps extends Pick<ResourceBoxProps, 'onAction'> {
  type?: any;
  url?: string;
  /**
   * 100, 62, 46
   */
  size?: number;
  playable?: boolean;
  invalid?: boolean;
  extra?: React.ReactNode;
}

export const Cover = ({ type, url, size = 100, playable, invalid, extra, onAction }: CoverProps) => {
  const { token } = theme.useToken();

  const sizeClass = css({ width: size, flex: `0 0 ${size}px`, height: size, fontSize: size / 2, borderRadius: 4 });
  const { ref, display } = useVideoDuration(url);

  const getContent = () => {
    if (url) {
      switch (type) {
        case 'NativeLoadingVideo':
        case 'PVAlphaVideo':
        case 'AlphaVideo':
        case 'NativeVideo':
        case 'Video':
          return (
            <div className={css({ height: '100%', width: '100%', position: 'relative' })}>
              <video key={url} ref={ref} crossOrigin="anonymous" src={absoluteUrl(url)} className={background} />
              <div
                className={css({
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  fontSize: 12,
                  color: 'white',
                  background: 'rgba(0, 0, 0, 0.62)',
                  padding: '2px 4px',
                  borderRadius: '0 0 0 4px',
                })}
              >
                {display}
              </div>
            </div>
          );
        default:
          return <img crossOrigin="anonymous" src={absoluteUrl(url)} className={background} />;
      }
    }
    return <TypeIcon type={type} />;
  };

  return (
    <div
      className={cx(
        sizeClass,
        css({
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          color: '#999',
        }),
        invalid &&
          css({
            background: '#ffccc7',
            color: token.colorErrorText,
          })
      )}
    >
      {getContent()}
      {playable ? (
        <div
          className={css({
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'flex',
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            transition: '200ms',
            height: '100%',
            width: '100%',
            opacity: 0,
            '&:hover': {
              opacity: 1,
            },
          })}
        >
          <Button size="small" type="primary" onClick={() => onAction?.('play')}>
            {size < 100 ? '预览' : '在画板中预览'}
          </Button>
        </div>
      ) : (
        extra
      )}
    </div>
  );
};
