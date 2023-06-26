import { useLoadingAction } from '@main/table';
import { message } from 'antd';
import { useMutation, UseMutationOptions } from 'react-query';

export type useTableParams<TData, TError, TVariables, TContext> = {
  success?: string;
  error?: string;
  tip?: string;
} & Pick<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn' | 'onSuccess' | 'onSettled' | 'onError'>;

export const useTableMutate = <TData, TError, TVariables, TContext>({
  mutationFn,
  onSuccess,
  tip,
  error,
  success,
  onSettled,
  onError,
}: useTableParams<TData, TError, TVariables, TContext>) => {
  const { startLoading, stopLoading } = useLoadingAction(tip);
  return useMutation({
    mutationFn,
    onMutate: startLoading,
    onSettled: (...args) => {
      stopLoading();
      onSettled?.(...args);
    },
    onError: (...args) => {
      message.error(error ?? (args[0] as any).message);
      onError?.(...args);
    },
    onSuccess: (...args) => {
      success && message.success(success);
      // 如果 onSuccess 返回 Promise 的话可以延迟触发 onSettled
      return onSuccess?.(...args);
    },
  } as UseMutationOptions<TData, TError, TVariables, TContext>).mutateAsync;
};
