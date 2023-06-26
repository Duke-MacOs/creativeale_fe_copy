import { useEffect, useState } from 'react';

export const useUrlVisible = (key: string) => {
  const result = useState(() => location.search.includes(`visible=${key}`));
  const [visible] = result;
  useEffect(() => {
    const url = new URL(location.href);
    if (visible) {
      url.searchParams.set('visible', key);
    } else {
      url.searchParams.delete('visible');
    }
    history.replaceState(undefined, '', url.href);
  }, [visible, key]);
  return result;
};
