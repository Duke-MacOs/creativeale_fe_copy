import { CSSProperties, useState } from 'react';
import { IData, ResourceTypeInModal } from '../type';

type Props = {
  data: IData;
  width: number | string;
  height: number | string;
  onError: () => void;
  style?: CSSProperties;
  onClick?: () => void;
};
const DefaultImg = 'https://sf3-cdn-tos.douyinstatic.com/obj/eden-cn/bqaeh7vhobd/feedback.svg';

const ErrorImage = ({ width, height }: Omit<Props, 'onError'>) => {
  return <img style={{ width, height, objectFit: 'contain' }} src={DefaultImg} />;
};

const Image = ({ data, width, height, style, onError, onClick }: Props) => {
  return (
    <img style={{ width, height, objectFit: 'cover', ...style }} src={data.cover} onError={onError} onClick={onClick} />
  );
};

const Video = ({ data, width, height, onError, onClick }: Props) => {
  return <video style={{ width, height, objectFit: 'contain' }} src={data.url} onError={onError} onClick={onClick} />;
};

const Audio = ({ data, width, height, onError, onClick }: Props) => {
  return <audio style={{ width, height, objectFit: 'contain' }} src={data.url} onError={onError} onClick={onClick} />;
};

export default (props: Omit<Props, 'onError'>) => {
  const [error, setError] = useState(false);
  const onError = () => {
    setError(true);
  };
  if (error) return <ErrorImage {...props} />;
  if (props.data.type === ResourceTypeInModal.Video) return <Video {...props} onError={onError} />;
  if (props.data.type === ResourceTypeInModal.Audio) return <Audio {...props} onError={onError} />;
  return <Image {...props} onError={onError} />;
};
