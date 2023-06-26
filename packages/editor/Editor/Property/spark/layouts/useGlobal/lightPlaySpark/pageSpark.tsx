import render, { ArrayCell, Spark, withContext } from '@editor/Editor/Property/cells';
import { imageSpark } from './groupSpark';

export default (page: any, setPage: (group: any, options?: any) => void): Spark => {
  return withContext(page, setPage, {
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
              imageSpark('preview', '分页封面'),
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
          label: '编辑分组列表',
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
            label="分组"
            array={children as any[]}
            onChange={onChange}
            defaultItem={{
              control: {
                type: 'section',
                tooltip: '帮助提示',
                label: '分组名称',
                children: [],
              },
            }}
            render={(value, onChange) => {
              return render(
                withContext(value, onChange, {
                  spark: 'enter',
                  index: 'control',
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
                })
              );
            }}
          />
        ),
      };
    },
  };
};
