import { SparkFn } from '..';
import { headerGroup } from '../groups';
import { ResourceBox } from '../groups/resourceSpark/ResourceBox';
import { colorSpark } from '../../common/colorSpark';
import { useSelector, useStore } from 'react-redux';
import { getIndexer } from '@editor/Editor/Property/cells';
import { updateMaterial } from '@editor/aStore';
import useCubemap from '@editor/Resource/entries/3d/Cubemaps/useCubemap';
import { debounce } from 'lodash';

export const Scene3D: SparkFn = (props, envs) => {
  return {
    spark: 'grid',
    content: [headerGroup]
      .map(fn => fn(props, envs))
      .concat([
        {
          spark: 'group',
          label: '雾',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'block',
                content: {
                  spark: 'select',
                  index: 'fogMode',
                  label: '雾模式',
                  defaultValue: 0,
                  options: [
                    {
                      label: '无',
                      value: 0,
                    },
                    {
                      label: '线性',
                      value: 1,
                    },
                  ],
                },
              },
              {
                spark: 'check',
                index: 'fogMode',
                check: {
                  hidden: fogMode => fogMode === 0,
                },
                content: {
                  spark: 'grid',
                  content: [
                    {
                      spark: 'block',
                      content: {
                        spark: 'flex',
                        content: [
                          {
                            spark: 'number',
                            index: 'fogStart',
                            label: '开始距离',
                            tooltip: '从视点到雾开始出现的距离',
                            step: 0.03,
                            precision: 2,
                            defaultValue: 0,
                          },
                          {
                            spark: 'number',
                            index: 'fogEnd',
                            label: '结束距离',
                            tooltip: '从视点到雾浓度达到最高的距离',
                            defaultValue: 300,
                            precision: 2,
                            step: 0.03,
                          },
                        ],
                      },
                    },
                    colorSpark({
                      spark: 'color',
                      index: 'fogColor',
                      label: '雾颜色',
                      defaultValue: [255, 255, 255],
                    }),
                  ],
                },
              },
            ],
          },
        },
        {
          spark: 'group',
          label: '天空盒',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'value',
                index: ['skyboxMaterialUrl', '_editor'],
                content([url = '', _editor = {}], onChange) {
                  const materialOrderId = url;
                  const { getState } = useStore<EditorState, EditorAction>();
                  const { scene3DApplyCubemap, scene3DCancelApplyCubemap } = useCubemap();
                  const material = getState().project.materials.find(({ orderId }) => orderId === Number(url));
                  const cubemap = getState().project.cubemaps.find(
                    ({ orderId }) => orderId === material?.material.props.cubemapUrl
                  );

                  return {
                    spark: 'element',
                    content() {
                      return (
                        <ResourceBox
                          type="Cubemaps"
                          name={_editor.skyboxName}
                          url={(material?.material.props.cubemapUrl as string) || ''}
                          cover={cubemap?.props.cover}
                          deletable={true}
                          onChange={({ url = '', cover }) => {
                            url === ''
                              ? scene3DCancelApplyCubemap(materialOrderId, () => {
                                  onChange([
                                    materialOrderId,
                                    {
                                      skyboxCover: '',
                                    },
                                  ]);
                                })
                              : scene3DApplyCubemap(url, (orderId = materialOrderId) => {
                                  onChange([
                                    orderId,
                                    {
                                      skyboxCover: cover,
                                    },
                                  ]);
                                });
                          }}
                        />
                      );
                    },
                  };
                },
              },
              {
                spark: 'value',
                index: 'skyboxMaterialUrl',
                content(url, onChange) {
                  const { getState, dispatch } = useStore();
                  const debounceOnChange = debounce(onChange, 800);
                  const material = getState().project.materials.find(({ orderId }: any) => orderId === Number(url));
                  return {
                    spark: 'context',
                    hidden: !material?.material.props.cubemapUrl,
                    content: {
                      spark: 'visit',
                      index: material?.id,
                      label: `${material?.material?.props?.name}` ?? '全景图',
                      content: {
                        spark: 'grid',
                        content: [
                          colorSpark({
                            spark: 'color',
                            index: 'tintColor',
                            label: '颜色',
                            defaultValue: [125, 125, 125, 1],
                          }),
                          {
                            spark: 'number',
                            label: '曝光',
                            index: 'exposure',
                            min: 0,
                            max: 8,
                            precision: 2,
                            defaultValue: 1,
                            step: 0.01,
                          },
                          {
                            spark: 'label',
                            label: '旋转',
                            content: {
                              spark: 'slider',
                              index: 'rotation',
                              min: 0,
                              max: 360,
                              defaultValue: 0,
                              step: 1,
                            },
                          },
                        ],
                      },
                    },
                    provide() {
                      return {
                        visiting: {} as any,
                        useValue(index, isEqual) {
                          const { indexValue, indexEntries } = getIndexer(index);

                          const value = useSelector(({ project: { materials } }: EditorState) => {
                            const target = materials.find(({ orderId }) => orderId === Number(url))!;
                            const { material } = target;
                            return [indexValue(material.props)];
                          }, isEqual);
                          return {
                            value,
                            onChange: async ([value]) => {
                              const self = getState().project.materials.find(
                                ({ orderId }: any) => orderId === Number(url)
                              )!;
                              if (self) {
                                dispatch(
                                  updateMaterial(self.id, {
                                    ...self.material,
                                    props: { ...self.material.props, ...Object.fromEntries(indexEntries(value)) },
                                  })
                                );
                                debounceOnChange(url);
                              }
                            },
                          };
                        },
                      };
                    },
                  };
                },
              },
            ],
          },
        },
      ]),
  };
};
