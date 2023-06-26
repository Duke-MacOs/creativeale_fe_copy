import { useEffect, useRef, useState } from 'react';

export const useVideoDuration = (url: any) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const { current } = ref;
    if (current) {
      const handler = () => {
        setDuration(current.duration);
      };
      current.addEventListener('loadedmetadata', handler);
      return () => {
        current.removeEventListener('loadedmetadata', handler);
      };
    }
  }, [url]);
  return { ref, duration, display: `${Math.max(duration, 0.1).toFixed(1)}s` };
};
