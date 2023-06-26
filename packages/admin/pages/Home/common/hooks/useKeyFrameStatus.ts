import { useImmer } from '@byted/hooks';
import { KEY_FRAME_IMAGE_STATUS } from '../../components/KeyFrameImage';

const { DEFAULT, MOUSE_ENTER, MOUSE_LEAVE } = KEY_FRAME_IMAGE_STATUS;
export default (length: number) => {
  const [keyFrameStatus, setKeyFrameStatus] = useImmer(Array(length).fill(DEFAULT));
  const setKeyFrame = (index: number, action: KEY_FRAME_IMAGE_STATUS) =>
    setKeyFrameStatus(keyFrameStatus => {
      keyFrameStatus[index] = action;
    });

  return {
    keyFrameStatus,
    setKeyFrameEnter: (index: number) => setKeyFrame(index, MOUSE_ENTER),
    setKeyFrameLeave: (index: number) => setKeyFrame(index, MOUSE_LEAVE),
    setKeyFrameDefault: (index: number) => setKeyFrame(index, DEFAULT),
  };
};
