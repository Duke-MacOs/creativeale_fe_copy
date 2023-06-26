import { debounce } from 'lodash';
import { useEffect } from 'react';

const onDebounceAction = debounce(
  (action: () => void) => {
    console.log('onIncreasePage2');
    action();
  },
  1500,
  { leading: true, trailing: false }
);

export default (container: HTMLElement | null, onScrollBottom?: any) => {
  useEffect(() => {
    if (!container) return;
    const onScroll = () => {
      const { scrollHeight, clientHeight, scrollTop } = container;
      const distance = scrollHeight - (scrollTop + clientHeight);
      if (distance > 0 && distance < 10) {
        onScrollBottom && onDebounceAction(onScrollBottom);
      }
    };
    container.addEventListener('scroll', onScroll);

    return () => {
      container.removeEventListener('scroll', onScroll);
    };
  }, [container, onScrollBottom]);
};
