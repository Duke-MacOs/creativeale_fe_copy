import { ImageSelectCell } from '../../groups/customGroups/ImageSelectCell';
import { callValue, Spark } from '@editor/Editor/Property/cells';
import { Button, Tooltip, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import groupSpark from './groupSpark';

export default function* toSpark(
  schema: any[] = [],
  setSchema: (schema: any[], options?: any) => void,
  hidden: boolean,
  showAll = true
): Generator<Spark> {
  for (const [index, { control = {}, attribute = {}, status = {} }] of schema.entries()) {
    const {
      type,
      children,
      label,
      tooltip,
      required,
      maxLength,
      precision,
      default: defaultValue,
      placeholder,
      min,
      max,
      unit,
      step,
      notes,
      options,
    } = control;
    const { path } = attribute;
    const getSetGroup = (map: (data: any, oldGroup: any) => any) => (data: any, options: any) => {
      const newSchema = schema.slice();
      newSchema[index] = map(data, newSchema[index]);
      setSchema(newSchema, options);
    };
    if (type === 'phase') {
      yield* toSpark(
        children,
        getSetGroup((children, schema) => ({ ...schema, control: { ...schema.control, children } })),
        hidden,
        showAll
      );
    } else if (type === 'section') {
      const content = Array.from(
        toSpark(
          children,
          getSetGroup((children, schema) => ({ ...schema, control: { ...schema.control, children } })),
          hidden,
          showAll
        )
      );
      yield {
        spark: 'group',
        tooltip: tooltip || notes,
        label: label || <Typography.Text type="secondary">分组名称</Typography.Text>,
        hidden: !content.length,
        content: {
          spark: 'grid',
          content,
        },
        extra: {
          spark: 'visit',
          index,
          hidden,
          label: '编辑分组信息',
          content: groupSpark(
            schema[index],
            getSetGroup(group => group)
          ),
          fallback(onVisit) {
            return {
              spark: 'element',
              content: () => (
                <Tooltip title="编辑分组信息">
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={onVisit} />
                </Tooltip>
              ),
            };
          },
        },
      };
    } else {
      if (showAll || ([] as string[]).concat(path).some(path => path.startsWith('res.'))) {
        if (type === 'input') {
          yield withStatus(
            status,
            withPath(path, {
              spark: 'string',
              label,
              tooltip: tooltip || notes,
              placeholder,
              required,
              width: 96,
              max: maxLength,
              defaultValue,
            })
          );
        } else if (type === 'inputNumber') {
          yield withStatus(
            status,
            withPath(path, {
              spark: 'number',
              tooltip: tooltip || notes,
              required,
              width: 96,
              placeholder,
              precision,
              unit,
              defaultValue,
              label,
              min,
              max,
              step,
            })
          );
        } else if (type === 'switch') {
          yield withStatus(status, {
            spark: 'label',
            tooltip: tooltip || notes,
            width: 96,
            label,
            content: withPath(path, {
              spark: 'boolean',
              required,
              defaultValue,
            }),
          });
        } else if (type === 'imageList') {
          yield withStatus(status, {
            spark: 'value',
            index: path,
            content(value, onChange) {
              return {
                spark: 'element',
                content: () => (
                  <ImageSelectCell
                    label={label}
                    tooltip={tooltip || notes}
                    value={Array.isArray(path) ? value[0] : value}
                    onChange={(value, options) => {
                      onChange(Array.isArray(path) ? path.map(() => value) : value, options);
                    }}
                    options={options.map(({ value, text, url }: any) => ({
                      type: 'Sprite',
                      value,
                      label: text,
                      cover: url,
                    }))}
                  />
                ),
              };
            },
          });
        } else if (type === 'radio') {
          yield withStatus(
            status,
            withPath(path, {
              spark: 'select',
              tooltip: tooltip || notes,
              placeholder,
              required,
              width: 96,
              label,
              defaultValue,
              options: options.map(({ value, text }: any) => ({ value, label: text })),
            })
          );
        } else {
          console.error('Unknown scheme type:', type);
        }
      }
    }
  }
}

const withPath = (path: any, spark: any): Spark => {
  if (!Array.isArray(path)) {
    return { ...spark, index: path };
  }
  return {
    spark: 'value',
    index: path,
    content(value, onChange) {
      return {
        spark: 'element',
        content: render =>
          render({
            ...spark,
            value: value[0],
            onChange(value: any, options?: any) {
              onChange(
                path.map(() => callValue(value, value[0])),
                options
              );
            },
          }),
      };
    },
  };
};

const withStatus = ({ hidden = {} }: any, spark: Spark): Spark => {
  const { path, activeValue } = hidden;
  if (!path) {
    return { spark: 'block', content: spark };
  }
  return {
    spark: 'check',
    index: path,
    check: {
      hidden: value => value !== activeValue,
    },
    content: { spark: 'block', content: spark },
  };
};
