import { css } from 'emotion';

const style = {
  img: css({
    maxWidth: '100%',
    maxHeight: '100%',
  }),
  audio: css({
    width: '50%',
    height: '50%',
  }),
  videoWrapper: css({
    position: 'relative',
  }),
  videoButton: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  }),
  audioWrapper: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }),
  audioButton: css({
    // position: 'absolute',
    // top: '50%',
    // left: '50%',
    // transform: 'translate(-50%,-50%)',
    width: '50%',
    height: '50%',
  }),
};

export default style;
