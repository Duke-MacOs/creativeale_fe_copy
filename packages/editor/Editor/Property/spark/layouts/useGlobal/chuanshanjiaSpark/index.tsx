import render, { ArrayCell, filterIndices, getIndexer, Spark, updateIndices } from '@editor/Editor/Property/cells';
import { floor, get, set } from 'lodash';
import { useEditor } from '@editor/aStore';

export const chuanshanjiaSpark = (): Spark => {
  return {
    spark: 'value',
    index: 'chuanshanjia',
    visit: true,
    content(value = {}, onChange) {
      const { propsMode } = useEditor(0, 'propsMode');
      const openKeysIndex = '_editor.openKeys';
      return {
        spark: 'context',
        provide: ({ openKeys: { enabled, checking } }) => {
          const openKeys = get(value, openKeysIndex) ?? [];
          return {
            openKeys: {
              enabled,
              checking,
              openKeys,
              setOpenKeys(checked, slice) {
                onChange(set({ ...value }, openKeysIndex, updateIndices(openKeys, checked, slice)));
              },
            },
            useValue(index) {
              const { indexValue, indexEntries } = getIndexer(index);
              return {
                value: [indexValue(value)],
                onChange([partial], options) {
                  onChange(Object.assign({}, value, Object.fromEntries(indexEntries(partial))), options);
                },
              };
            },
          };
        },
        content: propsMode === 'Product' ? filterIndices(content, get(value, openKeysIndex)) : content,
      };
    },
  };
};
const withStatus = (content: Spark): Spark => ({ spark: 'block', content });

const content: Spark = {
  spark: 'group',
  label: '穿山甲设置',
  content: {
    spark: 'grid',
    content: (
      [
        {
          spark: 'label',
          tooltip: '有无视频坑位',
          label: '视频坑位',
          content: {
            spark: 'boolean',
            index: 'play_with_video',
          },
        },
        {
          spark: 'select',
          index: 'playable_video_orientation',
          label: '横竖屏',
          options: ['横竖屏均可', '仅竖屏', '仅横屏'].map((label, value) => ({ label, value })),
          defaultValue: 0,
        },
        {
          spark: 'label',
          label: '打开App',
          content: {
            spark: 'boolean',
            index: 'is_playable_landpage_openApp',
          },
        },
        {
          spark: 'value',
          index: 'playable_dpa_list',
          content: (dpa_list = [], onChange) => ({
            spark: 'element',
            content: () => {
              const { propsMode } = useEditor(0, 'propsMode');
              return (
                <ArrayCell
                  label="动态商品"
                  array={dpa_list}
                  onChange={onChange}
                  defaultItem={{
                    dpa_id: '',
                    shop_num: 0,
                    product_num: 0,
                    price: 0,
                    style_id: 1,
                  }}
                  render={(item, onChange) =>
                    render({
                      spark: 'context',
                      provide() {
                        return {
                          useValue(index) {
                            const typeSafeIndex = index as keyof typeof item;

                            const processValue = (value: any) => {
                              const integerIndices = ['product_num', 'shop_num', 'style_id'];
                              return integerIndices.includes(typeSafeIndex) ? floor(value) : value;
                            };

                            return {
                              value: [processValue(item[typeSafeIndex])],
                              onChange: ([value]) => onChange({ ...item, [typeSafeIndex]: processValue(value) }),
                            };
                          },
                        };
                      },
                      content: {
                        spark: 'grid',
                        content: [
                          {
                            spark: 'string',
                            label: '动态商品ID',
                            index: 'dpa_id',
                            width: 80,
                          },
                          ...(propsMode === 'Product'
                            ? []
                            : ([
                                {
                                  spark: 'number',
                                  label: '商铺数量',
                                  index: 'shop_num',
                                  min: 0,
                                },
                                {
                                  spark: 'number',
                                  label: '商品数量',
                                  index: 'product_num',
                                  min: 0,
                                },
                                {
                                  spark: 'select',
                                  label: '商品价格',
                                  index: 'price',
                                  options: ['不限制价格', '仅限1元商品'].map((label, value) => ({ label, value })),
                                },
                                {
                                  spark: 'number',
                                  label: '样式ID',
                                  index: 'style_id',
                                  min: 0,
                                },
                              ] as Spark[])),
                        ],
                      },
                    })
                  }
                />
              );
            },
          }),
        },
      ] as Spark[]
    ).map(withStatus),
  },
};
