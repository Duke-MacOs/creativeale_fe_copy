import { createContext, Dispatch, FC, useCallback, useContext, useRef, useState } from 'react';

export type Loading = typeof initialLoading;

const initialLoading = { spinning: false, tip: '' };
export const LoadingContext = createContext<Dispatch<Loading> | undefined>(undefined);
export const withLoading = <P,>(Component: FC<P & { loading: Loading }>) => {
  return (props: P) => {
    const [loading, setLoading] = useState(initialLoading);
    const pendingListRef = useRef([] as Array<typeof loading>);

    return (
      <LoadingContext.Provider
        value={useCallback(
          value =>
            setLoading(loading => {
              const pendingList = pendingListRef.current;
              // 开始 loading
              if (value.spinning) {
                pendingList.push(value);
                return loading.spinning ? loading : value;
              } else {
                // 取消 loading
                pendingList.splice(pendingList.indexOf(value), 1);
                return pendingList.length > 0 ? pendingList[pendingList.length - 1] : { ...initialLoading };
              }
            }),
          []
        )}
      >
        <Component {...{ ...props, loading }} />
      </LoadingContext.Provider>
    );
  };
};
// 为什么需要一个数组 pending list 呢？
// 所有 useTableMutate/useQuery 设置的是同一个 loading 状态，这样的话就会出现以下这种情况
// 1. 在 正在删除 的 mutateFn 中 setLoading({tip:"正在删除",spinning:true})
// 2. 然后触发 删除操作的 onSuccess，发现 projectList.length === 0 所以调用 reloadProjectList
// 3. 在 reloadProjectList 的 queryFn 中 setLoading({tip:"正在加载",spinning:true})
// 3. 然后触发 正在删除 的 onSettled 中 setLoading({tip:'',spinning:false})，但是这时候 reloadProjectList 操作还未完成！

// 正确的执行顺序应该是：
// 1. 正在删除.startLoading => pendingList:[{tip:'正在删除',loading:true}] => 这时候展示的加载文本是“正在删除”
// 2. 正在加载.startLoading => pendingList:[{tip:'正在删除',loading:true},{tip:"正在加载",loading:true}] => 这时候展示的加载文本是“正在加载”
// 3. 正在删除.stopLoading => pendingList:[{tip:"正在加载",loading:true}] => 这时候依旧显示正在加载
// 4. 正在加载.stopLoading => pendingList:[] => 停止加载
export const useLoadingAction = (loadingTip = '正在加载') => {
  const loadingRef = useRef({ ...initialLoading });
  const setLoading = useContext(LoadingContext);
  return {
    startLoading: (tip = loadingTip) => setLoading?.(Object.assign(loadingRef.current, { spinning: true, tip })),
    stopLoading: () => setLoading?.(Object.assign(loadingRef.current, initialLoading)),
  };
};
