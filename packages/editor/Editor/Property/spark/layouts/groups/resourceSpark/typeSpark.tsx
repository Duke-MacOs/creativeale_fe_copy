import { SparkFn } from '../..';
import { Spark } from '../../../../cells';
import { ResourceBox, ResourceBoxProps } from './ResourceBox';
import { useReplaceAll } from './useReplaceAll';

export const typeSpark = (
  props: Omit<ResourceBoxProps, 'onChange'> & {
    baseType?: ResourceBoxProps['type'];
  },
  envs: Parameters<SparkFn>[1]
): Spark => {
  switch (props.type) {
    case 'Button':
      return buttonSpark(props, envs);
    case 'Text':
      return textSpark(props);
    case 'PVButton':
    case 'VRButton':
      return {
        spark: 'grid',
        content: [
          typeSpark({ ...props, type: 'Sprite', deletable: false, baseType: 'Button' }, envs),
          {
            spark: 'value',
            index: ['activeUrl', '_editor'],
            content([activeUrl, editor = {}], onChange) {
              return {
                spark: 'element',
                content() {
                  const onReplaceAll = useReplaceAll(activeUrl);
                  return (
                    <ResourceBox
                      {...props}
                      type="Sprite"
                      baseType="Button"
                      deletable={false}
                      size={editor.activeSize}
                      url={activeUrl}
                      originWidth={editor.activeOriginWidth}
                      originHeight={editor.activeOriginHeight}
                      name="激活图片"
                      onReplaceAll={({ url }) => {
                        onReplaceAll(url!);
                      }}
                      onChange={({ url, size, originWidth, originHeight }) => {
                        onChange([
                          url,
                          {
                            ...editor,
                            activeSize: size,
                            activeOriginWidth: originWidth,
                            activeOriginHeight: originHeight,
                          },
                        ]);
                      }}
                    />
                  );
                },
              };
            },
          },
        ],
      };
    case 'PVAlphaVideo':
    case 'AlphaVideo':
    case 'Video':
    case 'VRVideo':
    case 'Sound':
      return {
        spark: 'value',
        index: ['url', 'poster', 'name', 'cutSetting', '_editor'],
        content([url, poster, name, cutSetting, editor = {}], onChange) {
          return {
            spark: 'grid',
            content: [
              {
                spark: 'element',
                content() {
                  return (
                    <ResourceBox
                      deletable={true}
                      {...props}
                      {...(envs?.typeOfPlay === 4 && props.type === 'Video' ? { type: 'NativeVideo' } : {})}
                      url={url}
                      name={editor.name || name}
                      size={editor.size}
                      extra={cutSetting || null}
                      onChange={({ url, name: n, size, extra, poster }) => {
                        onChange([url, poster, name, extra, { ...editor, name: n, size }]);
                      }}
                    />
                  );
                },
              },
              {
                spark: 'element',
                hidden: props.type !== 'Video',
                content() {
                  return (
                    <ResourceBox
                      deletable={true}
                      {...props}
                      type="Sprite"
                      url={poster}
                      name="视频封面"
                      size={editor.posterSize}
                      onChange={({ url: poster, size }) => {
                        onChange([url, poster, name, cutSetting, { ...editor, posterSize: size }]);
                      }}
                    />
                  );
                },
              },
            ],
          };
        },
      };
    case 'FrameAnime':
    case 'Particle':
    case 'Lottie':
    case 'Model':
      return {
        spark: 'value',
        index: ['url', '_editor'],
        content([url, editor = {}], onChange) {
          return {
            spark: 'value',
            index: 'name',
            content(name) {
              return {
                spark: 'element',
                content() {
                  return (
                    <ResourceBox
                      {...props}
                      url={url}
                      name={url ? editor.name || name : undefined}
                      cover={editor.cover}
                      size={editor.size}
                      onChange={({ url, name, cover, size }) => {
                        onChange([url, { ...editor, name, cover, size }]);
                      }}
                    />
                  );
                },
              };
            },
          };
        },
      };
    case 'PVDragger':
    case 'Sprite':
      return {
        spark: 'value',
        index: ['url', '_editor'],
        content([url, editor = {}], onChange) {
          return {
            spark: 'value',
            index: ['width', 'height'],
            content([width, height], onChangeSize) {
              const onReplaceAll = useReplaceAll(url);
              return {
                spark: 'value',
                index: 'name',
                content(name) {
                  return {
                    spark: 'element',
                    content() {
                      return (
                        <ResourceBox
                          envs={envs}
                          deletable
                          {...props}
                          url={url}
                          type="Sprite"
                          baseType={props.type}
                          name={url ? editor.name || name : undefined}
                          cover={editor.cover}
                          size={editor.size}
                          originWidth={editor.originWidth}
                          originHeight={editor.originHeight}
                          extra={{ width, height }}
                          onChange={({ url, name, cover, size, extra, originWidth, originHeight }) => {
                            if (!extra) {
                              onChange([url, { ...editor, name, cover, size, originWidth, originHeight }]);
                              if (envs?.propsMode !== 'Product' && width > 0 && height > 0) {
                                onChangeSize([originWidth, originHeight]);
                              }
                            } else {
                              onChangeSize([extra.width, extra.height]);
                            }
                          }}
                          onReplaceAll={({ url }) => {
                            onReplaceAll(url!);
                          }}
                        />
                      );
                    },
                  };
                },
              };
            },
          };
        },
      };
    case 'DragonBones':
    case 'Container':
    case 'Animation':
    case 'Live2d':
    case 'Shape':
    case 'Spine':
    case 'Sprite3D':
    case 'Camera':
    case 'Light':
    case 'MeshSprite3D':
    case 'PanoramaHotSpot':
    case 'Animation3D':
      return {
        spark: 'value',
        index: 'name',
        content(name) {
          return {
            spark: 'element',
            content() {
              return (
                <ResourceBox
                  {...props}
                  name={name}
                  onChange={() => {
                    throw new Error('NotImplemented');
                  }}
                />
              );
            },
          };
        },
      };
    default:
      throw new Error(`NotImplemented: ${props.type}`);
  }
};

export const particleTextureSpark = (props: Omit<ResourceBoxProps, 'onChange'>): Spark => {
  return {
    spark: 'value',
    index: ['texture', '_editor'],
    content([texture, editor = {}], onChangeValue) {
      return {
        spark: 'value',
        index: 'name',
        content(name) {
          return {
            spark: 'element',
            content() {
              return (
                <ResourceBox
                  {...props}
                  type="Sprite"
                  baseType="Particle"
                  name={editor.textureName || name}
                  url={texture}
                  onChange={({ url, name: textureName }) => {
                    onChangeValue([url, { ...editor, textureName }]);
                  }}
                />
              );
            },
          };
        },
      };
    },
  };
};

const textSpark = (props: Omit<ResourceBoxProps, 'onChange'>): Spark => {
  return {
    spark: 'value',
    index: 'text',
    content(text, onChange) {
      return {
        spark: 'value',
        index: 'name',
        content(name) {
          return {
            spark: 'element',
            content() {
              return (
                <ResourceBox
                  {...props}
                  type="Text"
                  text={text}
                  name={name}
                  onChange={({ text }) => {
                    onChange(text);
                  }}
                />
              );
            },
          };
        },
      };
    },
  };
};

const buttonSpark = (props: Omit<ResourceBoxProps, 'onChange'>, envs: Parameters<SparkFn>[1]): Spark => {
  return {
    spark: 'value',
    index: ['url', 'text'],
    content([url]) {
      if (url) {
        return typeSpark({ ...props, type: 'Sprite', deletable: false, baseType: 'Button' }, envs);
      }
      return typeSpark({ ...props, type: 'Text' }, envs);
    },
  };
};
