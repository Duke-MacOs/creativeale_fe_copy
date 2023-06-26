import { css } from 'emotion';

export default {
  modal: css({
    textAlign: 'center',
  }),
  form: css({
    width: '90%',
    margin: '0 10%',
  }),
  upload: css({
    '&.ant-upload.ant-upload-drag': {
      width: '100px',
      height: '144px',
      '&>*': {
        padding: 0,
      },
    },
  }),
  empty: css({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }),
  textarea: css({
    '&>textarea.ant-input': {
      height: '100px',
    },
  }),
  checkbox: css({
    marginRight: '5px',
    marginBottom: '2px',
    verticalAlign: 'middle',
  }),
};
