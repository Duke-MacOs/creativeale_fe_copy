import { restoreState } from '@editor/aStore';
import render, { getIndexer, IContext, Spark } from '@editor/Editor/Property/cells';
import { getUsePanoramaEditValue } from '@editor/Editor/Property/spark';
import { enterAnimationTypeOptions } from '@editor/Editor/Property/spark/layouts/3D/PanoramaSpace';
import { ResourceBox } from '@editor/Editor/Property/spark/layouts/groups/resourceSpark/ResourceBox';
import { changePanoramaSpaceInPrevState } from '@editor/Template/Panorama/utils';
import { Button, Popover } from 'antd';
import { css } from 'emotion';
import { useState } from 'react';
import { shallowEqual, useSelector, useStore } from 'react-redux';

const usePanoramaDataProps = (): Spark => {
  const useValue = getUsePanoramaEditValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  const content: Spark = {
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
                      deletable
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
                            type="Sprite"
                            deletable
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
                            type="Sprite"
                            deletable
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
    // },
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

const getUsePanoramaSpaceValue = ({ dispatch, getState }: EditorStore): IContext['useValue'] => {
  return index => {
    const { indexValue, indexEntries } = getIndexer(index);
    const { value, panoramaSpaceId }: any = useSelector(({ project }: EditorState): any => {
      const {
        prevState,
        panoramaEdit: { panoramaSpaceId },
      } = project.editor;
      const scene = prevState?.scenes.find(scene => scene.id === prevState.editor.selectedSceneId);
      const node = scene ? Object.entries(scene.props).find(([key]) => key === `${panoramaSpaceId}`)?.[1] : {};
      return { value: [indexValue(node)], panoramaSpaceId };
    }, shallowEqual);

    return {
      value,
      onChange: async ([value]) => {
        const newState = changePanoramaSpaceInPrevState(
          getState().project,
          panoramaSpaceId,
          Object.fromEntries(indexEntries(value))
        );
        dispatch(restoreState(newState));
      },
    };
  };
};

const usePanoramaSpaceProps = (): Spark => {
  const useValue = getUsePanoramaSpaceValue(useStore());
  const [next, setNext] = useState([0 as string | number]);
  const content: Spark = {
    spark: 'group',
    label: '属性设置',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'label',
          label: '进场动画',
          content: {
            spark: 'select',
            index: 'enterAnimationType',
            options: enterAnimationTypeOptions,
            defaultValue: 0,
          },
        },
        {
          spark: 'block',
          content: {
            spark: 'label',
            label: '陀螺仪',
            content: {
              spark: 'boolean',
              index: 'gyroscopeEnabled',
              defaultValue: false,
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

const Content = () => {
  const panoramaEditSpark = usePanoramaDataProps();
  const panoramaSpacePropsSpark = usePanoramaSpaceProps();

  return (
    <div>
      {render(panoramaEditSpark)}
      <br />
      {render(panoramaSpacePropsSpark)}
    </div>
  );
};

export default () => {
  return (
    <div
      className={css({
        position: 'absolute',
        left: 5,
        bottom: 5,
        display: 'flex',
      })}
    >
      <Popover placement="rightBottom" content={Content} trigger="click">
        <Button>设置</Button>
      </Popover>
    </div>
  );
};
