import { useEffect } from 'react';
import { ImageItem, ImageItemProps } from '../../2d/Image/ImageItem';
import { useUpdateModelCover } from '@editor/Resource/upload';

export default (props: Omit<ImageItemProps, 'cover'> & { cover?: string; orderId?: number | undefined }) => {
  const updateModelCover = useUpdateModelCover();
  useEffect(() => {
    let isMounted = true;
    if (isMounted && !props.cover && props.orderId) {
      updateModelCover(props.orderId);
    }
    return () => {
      isMounted = false;
    };
  }, [props.cover]);
  return <ImageItem {...props} />;
};
