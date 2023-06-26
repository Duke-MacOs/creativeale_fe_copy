import { css } from 'emotion';

export default {
  container: css({
    position: 'absolute',
    bottom: '13px',
    transform: 'translateY(100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '9px',
  }),
  handle: css({
    scrollMarginLeft: '280px',
    scrollMarginRight: '96px',
    opacity: '0.6',
  }),
};
