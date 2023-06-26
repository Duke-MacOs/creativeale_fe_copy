import { RikoHook } from '@editor/utils';
import { pickBy } from 'lodash';
class PropConfig {
  static Script = class {};
  config: Partial<Omit<RikoHook, 'orderIndex'>> & { callee: RikoHook['callee'] };
  constructor(callee: RikoHook['callee'], options: Partial<Omit<RikoHook, 'orderIndex' | 'callee'>> = {}) {
    this.config = { callee, ...options };
  }
}

export const parseScript = (jsCode: string, orderId?: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Riko = getProxy('Riko');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Riko3D = getProxy('Riko3D');

  /**
   * 先兼容以前的形式
   */
  if (orderId) {
    const exports = {
      default: (_orderId: number) => PropConfig.Script,
    };
    eval(jsCode);
    const script = exports.default(orderId);
    if (script) {
      return parse(filter(new script()));
    }
  } else {
    const exports = {
      default: PropConfig.Script,
    };
    eval(jsCode);
    return parse(filter(new exports.default()));
  }
};

const getProxy = (callee: string): typeof Proxy =>
  new Proxy(PropConfig, {
    get(target: any, prop: string) {
      return Reflect.get(target, prop) ?? getProxy(`${callee}.${prop}`);
    },
    apply(target, _thisArg, args: any[]) {
      return Reflect.construct(target, [callee, ...args]);
    },
    construct(_target, args) {
      return { callee: `new ${callee}`, args };
    },
    getPrototypeOf() {
      return null;
    },
  });

export const filter = (record: Record<string, any>): typeof record => {
  return pickBy(record, value => {
    if (value === undefined || value === null || Array.isArray(value) || Object.getPrototypeOf(value) === null) {
      return false;
    }
    if (typeof value === 'object') {
      if (value.callee) {
        return value.callee.startsWith('Riko.use') || value.callee.startsWith('Riko3D.use');
      }
      return Object.keys(value).length === Object.keys(filter(value)).length;
    }
    return true;
  });
};

const parse = (record: Record<string, any> = {}, orderIndex = 0): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(record).reduce((entries, [key, val]) => {
      if (!key || key.startsWith('_')) {
        return entries;
      }
      const { config } =
        val instanceof PropConfig ? val : new PropConfig(typeof val as RikoHook['callee'], { default: val });
      switch (config.callee) {
        case 'Riko.useObject':
        case 'object': {
          const { default: record, ...rest } = config;
          const value = parse(filter(record as any), orderIndex);
          if (Object.keys(value).length) {
            entries.push([key, { orderIndex: orderIndex++, ...rest, value }]);
          }
          break;
        }
        case 'Riko.useArray': {
          const { defaultItem } = parse(filter(config), orderIndex);
          if (defaultItem) {
            entries.push([key, { orderIndex: orderIndex++, ...config, defaultItem, value: [] }]);
          }
          break;
        }
        case 'Riko.useEffect': {
          entries.push([
            key,
            {
              orderIndex: orderIndex++,
              ...config,
              default: {
                name: '透明动画',
                script: 'AlphaTo',
                __script: ['baseEffect', 'AlphaTo_透明动画'],
                targetId: -1,
                loop: false,
                time: 0,
                duration: 1000,
                alpha: 0,
              },
            },
          ]);
          break;
        }
        case 'Riko.useEvent': {
          entries.push([key, { orderIndex: orderIndex++, ...config, value: [] }]);
          break;
        }
        default: {
          entries.push([key, { orderIndex: orderIndex++, ...config }]);
        }
      }
      return entries;
    }, [] as [string, Partial<RikoHook>][])
  );
};
