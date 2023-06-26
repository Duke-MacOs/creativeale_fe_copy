import { useInView, IntersectionOptions, InViewHookResponse } from 'react-intersection-observer';
import { useState, useEffect } from 'react';

/**
 * 对 useInView 的封装，用于判断元素是否进入视窗，执行一次性动画。
 */
export function useInViewOnce(options?: IntersectionOptions): InViewHookResponse {
  const [realInView, setRealInView] = useState(false);
  const { ref, entry, inView } = useInView(options);

  useEffect(() => {
    if (inView) {
      setRealInView(inView);
    }
  }, [inView]);

  let result: InViewHookResponse;
  // eslint-disable-next-line prefer-const
  result = [ref, realInView, entry] as any;

  result.ref = ref;
  result.entry = entry;
  result.inView = realInView;

  return result;
}
