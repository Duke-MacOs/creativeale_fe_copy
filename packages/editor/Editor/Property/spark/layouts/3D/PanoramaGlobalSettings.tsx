import { changeProps, useEditor } from '@editor/aStore';
import render, { getIndexer, IContext, Spark } from '@editor/Editor/Property/cells';
import { getUsePanoramaEditValue, useGlobalSettings } from '@editor/Editor/Property/spark';
import { ResourceBox } from '@editor/Editor/Property/spark/layouts/groups/resourceSpark/ResourceBox';
import { useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';
import { PanoramaSpaceSpark } from './PanoramaSpace';

const usePanoramaDataProps = (): Spark => {
  const useValue = getUsePanoramaEditValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  const content: Spark = {
    spark: 'group',
    label: 'VR 全局配置',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'block',
          content: {
            spark: 'label',
            label: '全景标记',
            content: {
              spark: 'value',
              index: 'landMarkUrl',
              content(url, onChange) {
                return {
                  spark: 'element',
                  content() {
                    return (
                      <ResourceBox
                        type="Sprite"
                        url={url}
                        deletable={true}
                        onChange={({ url: src }) => {
                          onChange(src);
                        }}
                      />
                    );
                  },
                };
              },
            },
          },
        },
        {
          spark: 'block',
          content: {
            spark: 'enter',
            index: 'plan',
            content: {
              spark: 'grid',
              content: [
                {
                  spark: 'label',
                  label: '观察点',
                  tooltip: '中心观察点必须在图的正中央',
                  content: {
                    spark: 'value',
                    index: 'viewerUrl',
                    content(url, onChange) {
                      return {
                        spark: 'element',
                        content() {
                          return (
                            <ResourceBox
                              deletable
                              type="Sprite"
                              url={url}
                              onChange={({ url: src }) => {
                                onChange(src);
                              }}
                            />
                          );
                        },
                      };
                    },
                  },
                },
                {
                  spark: 'label',
                  label: '平面图',
                  content: {
                    spark: 'value',
                    index: 'planUrl',
                    content(url, onChange) {
                      return {
                        spark: 'element',
                        content() {
                          return (
                            <ResourceBox
                              deletable
                              type="Sprite"
                              url={url}
                              onChange={({ url: src }) => {
                                onChange(src);
                              }}
                            />
                          );
                        },
                      };
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  };
  return {
    spark: 'context',
    content: {
      spark: 'visit',
      index: 0,
      label: '全景编辑',
      content,
    },
    provide: () => {
      return {
        openKeys: {},
        useValue,
        visiting: {
          next,
          onVisit: setNext,
        },
      };
    },
  };
};

const getUsePanoramaSpaceValue = ({ dispatch }: EditorStore): IContext['useValue'] => {
  const { onChange: onChangeSelectedSceneId } = useEditor(0, 'selectedSceneId');

  return index => {
    const { indexValue, indexEntries } = getIndexer(index);
    const { value, panoramaSpaceId, mainSceneId }: any = useSelector(({ project }: EditorState): any => {
      const {
        panoramaEdit: { panoramaSpaceId, mainSceneId },
      } = project.editor;
      const scene = project.scenes.find(scene => scene.id === mainSceneId);
      const node = scene ? Object.entries(scene.props).find(([key]) => key === `${panoramaSpaceId}`)?.[1] : {};
      return { value: [indexValue(node)], panoramaSpaceId, mainSceneId };
    }, shallowEqual);

    return {
      value,
      onChange: async ([value]) => {
        onChangeSelectedSceneId(mainSceneId);
        dispatch(changeProps([panoramaSpaceId], Object.fromEntries(indexEntries(value))));
      },
    };
  };
};

const usePanoramaSpaceProps = (): Spark => {
  const useValue = getUsePanoramaSpaceValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  return {
    spark: 'context',
    content: {
      spark: 'visit',
      index: 0,
      label: '全景编辑',
      content: PanoramaSpaceSpark,
    },
    provide: () => {
      return {
        openKeys: {},
        useValue,
        visiting: {
          next,
          onVisit: setNext,
        },
      };
    },
  };
};

export const PanoramaGlobalSettings = () => {
  const globalSetting = useGlobalSettings();
  const panoramaEditSpark = usePanoramaDataProps();
  const panoramaSpacePropsSpark = usePanoramaSpaceProps();

  return (
    <div>
      {render(globalSetting)}
      {render(panoramaEditSpark)}
      <br />
      {render(panoramaSpacePropsSpark)}
    </div>
  );
};
