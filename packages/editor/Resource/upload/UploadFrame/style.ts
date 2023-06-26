import { css } from 'emotion';

const style = {
  confirmModal: css({
    '& .ant-modal-confirm-body > .anticon + .ant-modal-confirm-title + .ant-modal-confirm-content': css({
      marginLeft: '0',
    }),
    '& .ant-modal-confirm-btns': css({
      display: 'none',
    }),
  }),
  header: css({
    display: 'flex',
    width: '1075px',
    justifyContent: 'space-between',
  }),
  wrapper: css({
    width: '1075px',
    height: '650px',
    overflow: 'auto',
    display: 'flex',
  }),
  list: css({
    width: '240px',
    height: '650px',
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px 0 0',
    alignItems: 'center',
    overflow: 'auto',
  }),
  videoWrapper: css({
    width: '210px',
    height: '130px',
    margin: '10px',
    position: 'relative',
    boxSizing: 'content-box',
  }),
  video: css({
    width: '100%',
    height: '100%',
    position: 'relative',
  }),
  videoPlay: css({
    position: 'absolute',
    top: '55px',
    left: '93px',
    fontSize: '25px',
    color: 'white',
  }),
  audioContent: css({
    width: '210px',
    height: '130px',
    backgroundColor: '#f1f3f4',
  }),
  audioCover: css({
    width: '210px',
    height: '100px',
  }),
  audio: css({
    width: '210px',
    height: '30px',
  }),
  mask: css({
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  completeIcon: css({
    position: 'absolute',
    fontSize: '30px',
  }),
  centerAndRight: css({
    width: '800px',
    height: '650px',
    display: 'flex',
  }),
  center: css({
    width: '700px',
    height: '650px',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e5e5',
  }),
  tip: css({
    height: '100%',
    width: '100%',
  }),
  previewVideo: css({
    height: '500px',
    width: '500px',
  }),
  previewAudioWrapper: css({
    height: '500px',
    width: '500px',
    backgroundColor: '#f1f3f4',
  }),
  previewAudioCover: css({
    height: '400px',
    width: '500px',
  }),
  previewAudio: css({
    height: '100px',
    width: '500px',
  }),
  previewImage: css({
    height: '500px',
    width: '500px',
    objectFit: 'contain',
  }),
  info: css({
    width: '500px',
    display: 'flex',
    flexDirection: 'column',
    margin: '10px',
    alignItems: 'start',
    fontSize: 14,
  }),
  right: css({
    width: '130px',
    height: '650px',
    display: 'flex',
    marginLeft: '20px',
    flexDirection: 'column',
  }),
  uploadBtn: css({
    marginTop: '35px',
  }),
};

export default style;
