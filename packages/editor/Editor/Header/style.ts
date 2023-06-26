import { css } from 'emotion';
export default css({
  // background: '#fff',
  height: '60px',
  display: 'flex',
  flexShrink: 0,
  position: 'relative',
  zIndex: 1,
  boxShadow: 'rgb(0 0 0 / 8%) 0px 2px 4px',
  '&-content': {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    '&-1': {
      flex: '0 0 50px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 10,
    },
    '&-2': {
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
      '& .ant-input:focus, .ant-input-focused': {
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
      },
      '&>div': {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        borderLeft: '1px solid #EBEBEB',
        paddingLeft: '12px',
      },
    },
    '&-4': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flex: 1,
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    '&-3': {
      flex: '0 0',
      paddingRight: '16px',
      justifyContent: 'flex-end',
      marginLeft: 'auto',
    },
  },
  '&-img': {
    width: '23px',
    height: '22px',
    cursor: 'pointer',
    '& img': {
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    },
  },
  '&-input': {
    border: 'none',
    width: '100%',
    padding: '0',
    height: '24px',
  },
  '&-edit': {
    color: '#000000',
    '&:hover': {
      color: '#3955f6',
    },
    '&:active': {
      color: '#2e44c6',
    },
    '&:focus': {
      color: '#000000',
    },
  },
  '&-btn': {
    width: '52px',
    height: '46px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    '& .ant-btn': {
      width: '40px',
      height: '24px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // border: '0.4px solid #E0E0E0',
      // '&:hover': {
      //   borderColor: '#3955f6',
      //   color: '#3955f6',
      // },
      // '&:active': {
      //   borderColor: '#2e44c6',
      //   color: '#2e44c6',
      // },
      // '&:focus': {
      //   borderColor: '#E0E0E0',
      //   color: '#000000',
      // },
    },
    // '& .ant-btn-primary': {
    //   '&:hover': {
    //     color: '#ffffff',
    //   },
    //   '&:active': {
    //     color: '#ffffff',
    //   },
    //   '&:focus': {
    //     color: '#ffffff',
    //   },
    // },
  },
});
