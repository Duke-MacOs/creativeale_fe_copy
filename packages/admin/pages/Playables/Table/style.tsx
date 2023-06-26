import { css } from 'emotion';

export default {
  container: css({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '1208px',
    minHeight: '100%',
    borderRadius: '4px',
    margin: '16px',
    // background: '#fff',
  }),
  operator: css({
    display: 'flex',
    alignItems: 'center',
    padding: '24px 16px',
    borderBottom: '1px solid #dadfe3',
  }),
  coverWrapper: css({
    width: '64px',
    height: '100px',
    margin: '0 auto',
    position: 'relative',
  }),
  cover: css({
    width: '64px',
    height: '100px',
    borderRadius: '2px',
    objectFit: 'contain',
  }),
  preview: css({
    position: 'absolute',
    top: '0px',
    left: '0',
    width: '64px',
    height: '100px',
    fontSize: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
  }),
  btn: css({
    '& .ant-btn': css({
      padding: '0 6px',
    }),
  }),
  table: css({
    '& .ant-table-pagination.ant-pagination': css({
      padding: '0 16px',
    }),
  }),
  tag: css({
    padding: '0 4px',
    lineHeight: '18px',
    borderRadius: '2px',
  }),
};
