import { useState, useEffect } from 'react';
import { ImageItem, ImageItemProps } from '../../2d/Image/ImageItem';
import { captureNode3DData } from '@byted/riko';

export default (props: Omit<ImageItemProps, 'cover'> & { cover?: number | string }) => {
  const [cover, setCover] = useState('');
  useEffect(() => {
    let isMounted = true;
    captureNode3DData(props.cover as any).then((data: any) => {
      if (isMounted) {
        setCover(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [props.cover]);

  return <ImageItem {...props} cover={cover} />;
};
