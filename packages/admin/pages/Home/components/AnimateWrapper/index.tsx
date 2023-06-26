import { useBoolean } from '@byted/hooks';
import React, { useEffect, useRef } from 'react';

interface IAnimateWrapperProps {
  animationName: string;
  content: React.ReactNode;
}

export default function AnimateWrapper(props: IAnimateWrapperProps) {
  const { animationName, content } = props;
  const animateElement = useRef<HTMLDivElement | null>(null);
  const { state: viewable, setTrue: showContent, setFalse: hideContent } = useBoolean(false);

  useEffect(() => {
    // 只有csr的时候才会展现动画，ssr的时候直接不展示内容
    if (typeof window !== 'undefined') {
      animateElement.current?.classList.add('animate__animated', animationName);
      showContent();
    } else {
      hideContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={animateElement}
      style={{
        opacity: viewable ? 1 : 0,
      }}
    >
      {content}
    </div>
  );
}
