import { useEditor } from '@editor/aStore';

export default ({ schema = [], openKeys = [] }: any = {}) => {
  const { propsMode } = useEditor(0, 'propsMode');
  if (propsMode === 'Product') {
    return { schema: filter(schema, openKeys), hidden: true, openKeys };
  }
  return { schema, hidden: false, openKeys };
};

const filter = (schema: any[] = [], openKeys: string[] = []): any[] => {
  return schema.reduce((newSchema, schema) => {
    switch (schema.control.type) {
      case 'phase':
      case 'section':
        const children = filter(schema.control.children, openKeys);
        if (children.length) {
          newSchema.push({ ...schema, control: { ...schema.control, children } });
        }
        break;
      default:
        const path = schema.attribute?.path ?? [];
        if ((Array.isArray(path) ? path : [path]).every(path => openKeys.includes(path))) {
          newSchema.push(schema);
        }
        break;
    }
    return newSchema;
  }, [] as any[]);
};
