import { absoluteUrl } from '@shared/utils';
import render, { ArrayCell, filterSpark, NULL_SPARK, Spark, withContext } from '@editor/Editor/Property/cells';
import { ResourceBox } from '../../groups/resourceSpark/ResourceBox';
import TYPE_OPTIONS from './defaults';

export default (group: any, setGroup: (group: any, options?: any) => void): Spark => {
  return withContext(group, setGroup, {
    spark: 'enter',
    index: 'control',
    content: {
      spark: 'grid',
      content: [
        {
          spark: 'group',
          label: '编辑基础信息',
          content: {
            spark: 'grid',
            content: [
              {
                spark: 'string',
                label: '分组名称',
                index: 'label',
              },
              {
                spark: 'string',
                label: '帮助提示',
                index: 'tooltip',
              },
            ],
          },
        },
        {
          spark: 'group',
          label: '编辑字段列表',
          content: childrenSpark(),
        },
      ],
    },
  });
};

const childrenSpark = (): Spark => {
  return {
    spark: 'value',
    index: 'children',
    content(children, onChange) {
      return {
        spark: 'element',
        content: () => (
          <ArrayCell
            label="字段"
            array={children as any[]}
            onChange={onChange}
            defaultItem={{
              attribute: { type: 'string', path: 'res.storage.path' },
              control: TYPE_OPTIONS[0].value,
            }}
            render={(value, onChange) => {
              return render(
                withContext(
                  value,
                  onChange,
                  filterSpark({
                    spark: 'grid',
                    content: [
                      {
                        spark: 'enter',
                        index: 'control',
                        content: commonSpark(),
                      },
                      {
                        spark: 'enter',
                        index: 'control',
                        content: getContent(value.control.type),
                      },
                      {
                        spark: 'enter',
                        index: 'attribute',
                        content: pathSpark(),
                      },
                    ],
                  })
                )
              );
            }}
          />
        ),
      };
    },
  };
};

const commonSpark = (): Spark => {
  return {
    spark: 'grid',
    content: [
      typeSpark(),
      {
        spark: 'string',
        label: '字段名称',
        index: 'label',
      },
      {
        spark: 'string',
        label: '帮助提示',
        index: 'tooltip',
      },
      {
        spark: 'string',
        label: '详细帮助',
        index: 'notes',
      },
      {
        spark: 'string',
        label: '占位提示',
        index: 'placeholder',
      },
      { ...defaultSpark(), cols: 4 },
      {
        spark: 'label',
        label: '是否必填',
        cols: 2,
        content: { spark: 'boolean', index: 'required' },
      },
    ],
  };
};

const defaultSpark = (): Spark => {
  return {
    spark: 'value',
    index: ['type', 'options'],
    content([type, options]) {
      let spark: Spark = {
        spark: TYPE_OPTIONS.find(({ value: v }) => v.type === type)!.spark,
        label: '默认值',
        index: 'default',
      };
      if (spark.spark === 'boolean') {
        spark = { spark: 'label', content: spark };
      }
      if (spark.spark === 'select') {
        spark.options = options?.map(({ value, text }: any) => ({ value, label: text }));
      }
      return { ...spark, label: '默认值' };
    },
  };
};

const typeSpark = (): Spark => {
  return {
    spark: 'value',
    index: 'type',
    content(type, onChange) {
      return {
        spark: 'element',
        content: render =>
          render({
            spark: 'select',
            label: '配置类型',
            options: TYPE_OPTIONS.map(({ label, value }) => ({
              label,
              value: value.type,
            })),
            value: type,
            onChange(type) {
              const { value } = TYPE_OPTIONS.find(({ value }) => value.type === type)!;
              onChange(value, { replace: true });
            },
          }),
      };
    },
  };
};

const pathSpark = (): Spark => {
  return {
    spark: 'value',
    index: 'path',
    content(path, onChange) {
      return {
        spark: 'element',
        content: () => (
          <ArrayCell
            label="路径"
            array={Array.isArray(path) ? path : [path]}
            onChange={(value, options) => onChange(value.length === 1 ? value[0] : value, options)}
            render={(value, onChange) =>
              render({
                spark: 'element',
                content: render =>
                  render({
                    spark: 'string',
                    label: '路径',
                    onChange,
                    value,
                  }),
              })
            }
          />
        ),
      };
    },
  };
};

const getContent = (type: string): Spark => {
  switch (type) {
    case 'input':
      return {
        spark: 'number',
        index: 'maxLength',
        label: '最大长度',
        min: 0,
        step: 1,
        precision: 0,
        unit: '字',
      };
    case 'inputNumber':
      return {
        spark: 'grid',
        content: [
          {
            spark: 'number',
            label: '最小值',
            step: 1,
            precision: 0,
            index: 'min',
            cols: 3,
          },
          {
            spark: 'number',
            label: '最大值',
            step: 1,
            precision: 0,
            index: 'max',
            cols: 3,
          },
          {
            spark: 'number',
            label: '步长',
            index: 'step',
            width: 48,
            cols: 2,
          },
          {
            spark: 'number',
            width: 48,
            label: '精度',
            index: 'precision',
            step: 0,
            precision: 0,
            cols: 2,
          },
          {
            spark: 'string',
            width: 48,
            label: '单位',
            index: 'unit',
            cols: 2,
          },
        ],
      };
    case 'imageList':
    case 'radio':
      return {
        spark: 'value',
        index: 'options',
        content(options = [], onChange) {
          return {
            spark: 'element',
            content: () => (
              <ArrayCell
                label="选项"
                array={options}
                onChange={onChange}
                defaultItem={{}}
                render={(value, onChange) => {
                  return render(
                    withContext(value, onChange, {
                      spark: 'grid',
                      content: [
                        { ...imageSpark('url', '选项Image'), hidden: type === 'radio' },
                        { spark: 'string', label: '选项Label', index: 'text' },
                        { spark: 'number', label: '选项Value', index: 'value' },
                      ],
                    })
                  );
                }}
              />
            ),
          };
        },
      };
    case 'switch':
    default:
      return NULL_SPARK;
  }
};

export const imageSpark = (index: string, label: string): Spark => {
  return {
    spark: 'value',
    index,
    content(url, onChange) {
      return {
        spark: 'element',
        content: () => (
          <ResourceBox
            name={label}
            url={url}
            type="Sprite"
            onChange={({ url }) => {
              onChange(absoluteUrl(url!));
            }}
          />
        ),
      };
    },
  };
};
