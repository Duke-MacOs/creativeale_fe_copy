import { toColorful } from '@shared/utils';
import { ISceneState } from '@editor/aStore';
import { findById } from '@editor/utils';

const useStringAccept = (prop: any): void => {
  if (Array.isArray(prop)) {
    return prop.forEach(useStringAccept);
  }
  if (prop && typeof prop === 'object') {
    const { callee, accept, default: d, value = d, name, tooltip } = prop;
    const notAccept = () => {
      try {
        if (accept && !new RegExp(accept, 'i').test(value)) {
          return true;
        }
      } catch (e) {
        console.log(e);
      }
      return false;
    };

    if (callee === 'Riko.useString' && notAccept()) {
      throw new Error(tooltip || `${name}不符合“${accept}”`);
    }
    useStringAccept(Object.values(prop));
  }
};

export function* checkUseStringAccept({ props, nodes, name }: ISceneState) {
  for (const [id, prop] of Object.entries(props)) {
    try {
      useStringAccept(prop);
    } catch (error) {
      const names = (() => {
        if (prop.type === 'Script') {
          const [{ name }] = findById(nodes, Number(id), true);
          return [{ text: name! }, '的', { text: prop.name! }];
        }
        return [{ text: prop.name! }];
      })();

      yield {
        type: `UseStringAccept:${id}`,
        message: toColorful({ text: name }, ...names, error.message),
        warning: toColorful(...names, error.message),
      };
    }
  }
}
