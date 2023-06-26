import { set, get } from 'lodash';
import defaultSchema from './schema.json';

export default (schema = defaultSchema, oldValue: any = {}) => ({ ...getValue(schema, oldValue), _editor: { schema } });

const getValue = (schema: any[] = [], oldValue: any, value: any = {}) => {
  for (const { control, attribute } of schema) {
    switch (control.type) {
      case 'phase':
      case 'section':
        getValue(control.children, oldValue, value);
        break;
      default:
        for (const path of [attribute.path ?? []].flat()) {
          set(value, path, get(oldValue, path) ?? control.default);
        }
    }
  }
  return value;
};
