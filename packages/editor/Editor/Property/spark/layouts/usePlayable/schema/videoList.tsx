import { changeProps, groupActions, selectNode, useAddNode, useOnDelete } from '@editor/aStore';
import { ResourceChanger } from '../../groups/resourceSpark/ResourceBox/Actions';
import { ResourceBox } from '../../groups/resourceSpark/ResourceBox';
import { useEffect, useMemo, useRef, useState } from 'react';
import { centerNode, getScene } from '@editor/utils';
import { useSelector, useStore } from 'react-redux';
import { PlusOutlined } from '@ant-design/icons';
import { Spark } from '../../../../cells';
import { TitleTip } from '@editor/views';
import { debounce } from 'lodash';
import { Button } from 'antd';

const PIXEL = 32;

export default {
  spark: 'value',
  index: 'color',
  content(_, onChangeColor) {
    const { getState, dispatch } = useStore<EditorState, EditorAction>();
    const [visible, setVisible] = useState(false);
    const onAddNode = useAddNode();
    const { onDelete } = useOnDelete();
    const scene = useSelector(({ project }: EditorState) => getScene(project));
    const videoIds = scene.nodes
      .filter(({ type }) => type === 'Video')
      .map(({ id }) => id)
      .reverse();
    const videos = videoIds.map(id => scene.props[id]);
    const selectIndex = (index: number) => {
      dispatch(
        groupActions(
          videoIds.map((id, i) => {
            return changeProps([id], { enabled: i === index });
          })
        )
      );
    };
    const context = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.height = PIXEL;
      canvas.width = PIXEL;
      return canvas.getContext('2d')!;
    }, []);
    return {
      spark: 'grid',
      content: [
        {
          spark: 'grid',
          hidden: !videos.length,
          content: (videos as any[]).map(
            ({ url, name, _editor, enabled = true }, index): Spark => ({
              spark: 'element',
              space: url,
              content: () => {
                const ref = useRef<HTMLDivElement>(null);
                useEffect(() => {
                  if (enabled && ref.current) {
                    const video = ref.current.querySelector('video');
                    if (!video) {
                      console.error('no video found');
                      return;
                    }
                    video.crossOrigin = 'anonymous';
                    const listener = debounce(() => {
                      context.clearRect(0, 0, PIXEL, PIXEL);
                      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, PIXEL, PIXEL);
                      const rgb = [0, 0, 0];
                      const data = context.getImageData(0, 0, PIXEL, PIXEL).data;
                      for (let i = 0; i < data.length; i++) {
                        for (let j = 0; j < rgb.length; j++) {
                          rgb[j] += data[i++];
                        }
                      }
                      const values = rgb.map(v =>
                        Math.floor((v * 4) / data.length)
                          .toString(16)
                          .padStart(2, '0')
                      );
                      onChangeColor(`#${values.join('')}`);
                    }, 1000);
                    if (video.readyState !== 4) {
                      video.addEventListener('loadeddata', listener);
                      return () => {
                        video.removeEventListener('loadeddata', listener);
                      };
                    }
                    listener();
                  }
                  // eslint-disable-next-line react-hooks/exhaustive-deps
                }, [enabled]);
                return (
                  <div
                    style={{ border: enabled ? '1px solid #3955F6' : '1px solid transparent', borderRadius: 4 }}
                    onClick={() => {
                      selectIndex(index);
                    }}
                  >
                    <ResourceBox
                      deletable
                      type="NativeLoadingVideo"
                      domRef={ref}
                      url={url}
                      name={_editor?.name || name}
                      onChange={({ url, ...rest }) => {
                        if (url) {
                          dispatch(changeProps([videoIds[index]], { url, _editor: { ..._editor, ...rest } }));
                        } else {
                          if (enabled && videoIds.length > 1) {
                            selectIndex((index + 1) % videoIds.length);
                          }
                          onDelete({ nodeIds: [videoIds[index]] });
                          dispatch(selectNode([]));
                        }
                      }}
                    />
                  </div>
                );
              },
            })
          ),
        },
        {
          spark: 'element',
          hidden: videos.length >= 5,
          content: () => {
            return (
              <div>
                <TitleTip
                  placement="bottom"
                  title={
                    <>
                      <div>尺寸要求：9:16, 720*1280px及以上</div>
                      <div>格式要求：MOV或MP4</div>
                      <div>时长要求：2~5秒</div>
                      <div>大小要求：≤5M</div>
                    </>
                  }
                >
                  <Button
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                    onClick={() => {
                      setVisible(true);
                    }}
                  >
                    添加视频
                  </Button>
                </TitleTip>
                {visible && (
                  <ResourceChanger
                    eleType="NativeLoadingVideo"
                    onClose={() => {
                      setVisible(false);
                    }}
                    onChange={({ name, url, extra, cover }) => {
                      const scene = getScene(getState().project);
                      onAddNode(
                        {
                          mime: 'Video',
                          name,
                          url,
                          cover,
                          extra,
                          targetId: scene.nodes[0].id,
                          dropWhere: 'before',
                          mapNode(node) {
                            node.editor = { ...node.editor, isLocked: true };
                            (node.scripts?.[0]?.props as any).loop = true;
                            return centerNode(node);
                          },
                        },
                        true
                      ).then(() => {
                        selectIndex(-1);
                        dispatch(selectNode([]));
                      });
                    }}
                  />
                )}
              </div>
            );
          },
        },
      ],
    };
  },
} as Spark;
