import { useDebounceFn } from '@byted/hooks';
import { collectEventSearchParams } from '@main/collectEvent';
import { isFunction, mapValues } from 'lodash';
import { createContext, FC, useContext } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';

type Params = {
  [key: string]: string | number | boolean | undefined;
};

type PathOf<P extends Params> = {
  pathOf(params?: Partial<P>): string;
  label: string;
  path: string[];
};

export interface WithPathProps<P extends Params> extends Omit<RouteComponentProps<any>, 'match'> {
  match: Omit<RouteComponentProps<any>['match'], 'params'> & { params: P } & PathOf<P>;
}

export interface IPageParams extends Params {
  page: number;
  pageSize: number;
}
export interface IParamsContext<P extends Params = Params> {
  defaultParams: P;
  params: P;
  onParamsChange: (
    partial?: Partial<P> | ((params: P, defaultParams: P) => P),
    options?: { resetPage?: boolean }
  ) => void;
}
export const ParamsContext = createContext({} as IParamsContext<any>);
export const usePageParams = <P extends IPageParams>() => useContext<IParamsContext<P>>(ParamsContext);

export type WithPathReturn<P extends Params> = FC<WithPathProps<P>> & PathOf<P>;

export default function withPath<P extends Params>(
  Component: FC<WithPathProps<P>>,
  label: string,
  path: string,
  defaultParams: P
): FC<WithPathProps<P>> & PathOf<P> {
  const [routingPaths, positionalKeys] = getPathsAndKeys(path, defaultParams);
  const [pathOf, transform] = getPathOfAndTransform(path, defaultParams, positionalKeys);
  const WithPathComponent = () => {
    const { run: query } = useDebounceFn((transProps, partial) => {
      transProps.history.push(pathOf(partial));
    }, 200);
    return (
      <Route
        render={props => {
          const transProps = transform(props);
          return (
            <ParamsContext.Provider
              value={{
                defaultParams,
                params: transProps.match.params,
                onParamsChange: (partialOrFn, { resetPage } = { resetPage: true }) => {
                  const partial = isFunction(partialOrFn)
                    ? partialOrFn(transProps.match.params, defaultParams)
                    : partialOrFn || defaultParams;

                  // 清除所有搜索内容
                  if (resetPage) {
                    // 重置页码
                    Object.assign(partial, { page: 1 });
                  }
                  query(transProps, partial);

                  const entries = Object.entries(partial).filter(([key, value]) => value !== defaultParams[key]);
                  if (entries.length) {
                    collectEventSearchParams(Object.fromEntries(entries));
                  }
                },
              }}
              children={<Component {...transProps} />}
            />
          );
        }}
      />
    );
  };

  WithPathComponent.displayName = `withPath(${Component.displayName || Component.name || path})`;
  WithPathComponent.path = routingPaths.slice().reverse();
  WithPathComponent.pathOf = pathOf;
  WithPathComponent.label = label;
  return WithPathComponent;
}

const getPathsAndKeys = (path: string, params: Record<string, unknown>) => {
  const items = path.split('/').reverse();
  const routingPaths = [] as string[];
  for (const [index, item] of items.entries()) {
    routingPaths.push(items.slice(index).reverse().join('/') || '/');
    if (!item.startsWith(':')) {
      break;
    }
  }
  const positionalKeys = [] as string[];
  for (const item of items) {
    if (item.startsWith(':')) {
      if (!params.hasOwnProperty(item.slice(1))) {
        throw new Error(`The "${item}" in "${path}" is missing default value from ${JSON.stringify(params)}.`);
      }
      positionalKeys.push(item.slice(1));
    }
  }
  return [routingPaths, positionalKeys] as const;
};

const getPathOfAndTransform = <P extends Params>(path: string, defaultParams: P, positionalKeys: (keyof P)[]) => {
  let currentParams = defaultParams;
  const pathOf: PathOf<P>['pathOf'] = partial => {
    currentParams = { ...currentParams, ...partial } as P;
    let pathname = path;
    for (const key of positionalKeys) {
      if (!pathname.endsWith(`:${String(key)}`) || currentParams[key] !== defaultParams[key]) {
        pathname = pathname.replace(`:${String(key)}`, encodeURI(String(currentParams[key])));
      } else {
        pathname = pathname.replace(`/:${String(key)}`, '');
      }
    }
    return `${pathname}${formatParams(currentParams)}`;
  };
  const formatParams = (params: P) => {
    const result = [] as string[];
    for (const [key, value] of Object.entries(params)) {
      if (positionalKeys.includes(key) || value == null || value === defaultParams[key]) {
        continue;
      }
      result.push(`${key}=${encodeURIComponent(value)}`);
    }
    if (result.length) {
      return `?${result.join('&')}`;
    }
    return '';
  };
  const transform = (props: any): WithPathProps<any> => {
    const {
      match: { params },
      location: { search },
    } = props;
    props.match.pathOf = pathOf;
    currentParams = props.match.params = fixParams({
      ...defaultParams,
      ...Object.fromEntries(new URLSearchParams(search)),
      ...params,
    });
    return props;
  };
  const fixParams = (params: Record<string, unknown>) => {
    return mapValues(params, (value, key) => {
      if (typeof value === 'string') {
        switch (typeof defaultParams[key]) {
          case 'number':
            return Number(value);
          case 'boolean':
            return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
        }
      }
      return value;
    }) as P;
  };
  return [pathOf, transform] as const;
};
