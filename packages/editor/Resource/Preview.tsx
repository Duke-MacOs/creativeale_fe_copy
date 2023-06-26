import React, { useState, useRef, RefObject, ForwardedRef, useEffect } from 'react';
import { css } from 'emotion';
import { useEmitter } from '@editor/aStore/selectors';
import { useStore } from 'react-redux';
import { intoScene } from '@editor/utils';
import { amIHere } from '@shared/utils';
import { theme } from 'antd';

export default function Preview({ content }: any) {
  const { token } = theme.useToken();
  const { getState } = useStore<EditorState, EditorAction>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('abcde');
  const [size, setSize] = useState<'big' | 'small' | 'none'>('none');
  const [preVideo, setPreVideo] = useState<string>('');
  const [author, setAuthor] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clearIframe, postMessage } = usePostMessage(iframeRef);

  useEmitter('ViewResource', async ({ type, category, url, name, description, extra }: any) => {
    if (type === 'enter') {
      if (
        [
          'Lottie',
          'Particle',
          'FrameAnime',
          'Spine',
          'DragonBones',
          'Sprite',
          'Animation',
          'PSD',
          'Live2d',
          'Skybox',
        ].includes(category)
      ) {
        category = convertCategory(category);
        if (['spine', 'dragonBones', 'component', 'psd'].includes(category)) {
          setSize('big');
        } else {
          setSize('small');
        }
        setName(name);
        setDescription(description);
        setAuthor(extra?.userName ?? '');
        if (extra?.previewVideo) {
          setPreVideo(extra?.previewVideo);
        } else {
          if (iframeRef.current) {
            if (typeof url === 'number') {
              const { project } = getState();
              const { scenes, customScripts, settings } = project;
              const componentScenes = scenes.filter(scene => scene.type === 'Animation').map(scene => intoScene(scene));
              const previewData = {
                scenes: componentScenes,
                customScripts,
                settings: {
                  ...settings,
                  sceneOrders: [url],
                },
              };
              postMessage({
                type: 'change',
                url: settings.basePath,
                projectType: 'scene',
                loop: true,
                data: previewData,
              });
            } else {
              postMessage({
                type: 'change',
                url,
                projectType: category,
                loop: true,
              });
            }
          }
        }
      }
    } else {
      setSize('none');
      setPreVideo('');
      clearIframe();
    }
  });

  return (
    <div
      className={css({
        position: 'absolute',
        top: 4,
        right: 0,
        width: 214,
        padding: 6,
        borderRadius: 4,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
        transform: 'translate(100%)',
        pointerEvents: 'none',
      })}
      style={{ right: content ? '-260px' : '0', visibility: size !== 'none' ? 'visible' : 'hidden' }}
    >
      {preVideo && (
        <video
          style={{ position: 'absolute', top: 6, left: 6, zIndex: 99999 }}
          src={preVideo}
          autoPlay={true}
          loop
          width={200}
          height={size === 'big' ? 356 : 200}
        />
      )}
      <IframePreview ref={iframeRef} width={200} height={size === 'big' ? 356 : 200} scale={1.2} />

      <div className={css({ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'center' })}>
        {name}
      </div>
      {description && (
        <div
          className={css({
            borderTop: '1px solid #ccc',
            paddingTop: 2,
            wordBreak: 'break-all',
            wordWrap: 'break-word',
            maxHeight: 200,
            overflow: 'scroll',
          })}
        >
          {description}
        </div>
      )}
      {author && (
        <div
          className={css({
            paddingTop: 2,
            overflow: 'scroll',
            textAlign: 'center',
          })}
        >
          作者：{author}
        </div>
      )}
    </div>
  );
}

interface IIframePreview {
  width: number;
  height: number;
  scale?: number;
  enableLoading?: boolean;
  loaded?: boolean;
}

export const IframePreview = React.memo(
  React.forwardRef(
    (
      { width, height, scale = 1, ...rest }: IIframePreview & React.ComponentPropsWithoutRef<'iframe'>,
      ref: ForwardedRef<HTMLIFrameElement>
    ) => {
      return (
        <div
          className={css({
            width,
            height,
            overflow: 'hidden',
          })}
        >
          <iframe
            ref={ref}
            src={
              amIHere({ release: true })
                ? 'https://magicplay.oceanengine.com/static-cloud/invoke/riko_player?type=preload'
                : ['https://local-clab.', 'bytedance', '.net/static-cloud/invoke/riko_player?type=preload'].join('')
            }
            allow="autoplay"
            frameBorder="0"
            className={css({
              width,
              height,
              position: 'relative',
              transformOrigin: '0 0',
              border: 'none',
              ...(scale
                ? {
                    transform: `scale(${scale})`,
                    left: `-${(width * (scale - 1)) / 2}px`,
                    top: `-${(height * (scale - 1)) / 2}px`,
                  }
                : {}),
            })}
            onError={e => {
              console.log('e:', e);
            }}
            {...rest}
          />
        </div>
      );
    }
  )
);

export function usePostMessage(ref: RefObject<HTMLIFrameElement>) {
  const log = useRef<any>([]);
  window.previewLog = () => {
    console.log(log.current);
  };
  return {
    postMessage: (msg: Record<string, any>) => {
      log.current.push(msg);
      ref.current?.contentWindow?.postMessage(JSON.stringify(msg), '*');
    },
    clearIframe: () => {
      ref.current?.contentWindow?.postMessage(
        JSON.stringify({
          type: 'clear',
        }),
        '*'
      );
    },
  };
}

const convertCategory = (category: string) => {
  if (category === 'FrameAnime') {
    category = 'frame';
  }
  if (category === 'Sprite') {
    category = 'image';
  }
  if (category === 'Animation') {
    category = 'component';
  }
  if (category === 'PSD') {
    category = 'psd';
  }
  return category.replace(/^\w/, (s: string) => s.toLowerCase());
};
