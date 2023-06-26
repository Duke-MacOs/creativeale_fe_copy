import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { changeProps } from '../project';
import { getScene } from '@editor/utils';

type Options = Parameters<typeof changeProps>[2];

type Props<K extends string, V> = {
  [k in K]: V;
} & { onChange: (value: V, options?: Options) => void };

export function useProps(id: number): Props<'props', Record<string, unknown>>;
export function useProps<V, K extends string = string>(id: number, key: K, defaultValue?: V): Props<K, V>;
export function useProps<V, K extends string = string>(id: number, key?: K, defaultValue?: V): any {
  const value = useSelector(({ project }: EditorState) => {
    const {
      props: { [id]: props },
    } = getScene(project);
    if (key) {
      return ((props as any)[key] as V) || defaultValue;
    }
    return props;
  }, shallowEqual);
  const dispatch = useDispatch<EditorDispatch>();
  return {
    [key ?? 'props']: value,
    onChange: useCallback(
      (value: any, options?: Options) => {
        dispatch(changeProps([id], key ? { [key]: value } : value, options));
      },
      [dispatch, id, key]
    ),
  } as Props<K, V>;
}
