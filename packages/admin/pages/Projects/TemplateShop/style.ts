import { css } from 'emotion';

const style = {
  container: css({
    minHeight: '100%',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#f7f8fa',
    alignItems: 'center',
  }),
  list: css({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '1080px',
    borderRadius: '4px',
    // background: '#fff',
    width: '95%',
    margin: '0 auto',
  }),
  select: css({
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '24px',
  }),
  space: css({
    width: '400px',
  }),
  empty: css({
    height: '100%',
    width: '100%',
    marginTop: '-700px',
  }),
  items: css({
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    width: '1440px',
    margin: '0 auto',
  }),
  item: css({
    margin: '0 30px 40px 0',
    width: '215px',
    '&:nth-of-type(6n)': {
      marginRight: 0,
    },
    '& .ant-card-body': {
      padding: '12px',
    },
  }),
  cover: css({
    width: '100%',
    height: '100%',
    padding: '1px',
    position: 'relative',
  }),
  bgImg: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: '0',
    left: '0',
    opacity: ' 0.4',
  }),
  coverImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    top: '0',
    left: '0',
  }),
  mask: css({
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
    opacity: 0,
    borderRadius: '4px',
  }),
  title: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
  }),
  name: css({
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  countAndIsFree: css({
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'row',
    color: 'gray',
    justifyContent: 'space-between',
  }),
  count: css({
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  countIcon: css({
    marginRight: '5px',
  }),
  isFree: css({}),
  idTag: css({
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    lineHeight: '20px',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    color: '#333',
    marginRight: '4px',
  }),
  copyText: css({
    cursor: 'pointer',
    color: '#3955f6',
    marginLeft: '17px',
  }),
  typeButton: css({ width: '150px' }),
  addImage: css({
    width: '100px',
    height: '100px',
    margin: '156px 0 10px 0',
  }),
  radioButton: css({
    margin: '10px',
    border: 'none',
    borderRadius: '2px',
    '&:hover': {
      color: 'rgb(51,51,51)',
    },
    '&::before': {
      width: '0 !important',
    },
  }),
  materialCover: '',
  add: '',
};

style.materialCover = css({
  position: 'relative',
  borderRadius: '4px 4px 0px 0px',
  width: '215px',
  height: '373px',
  [`&:hover .${style.mask}`]: {
    opacity: 1,
    background: 'rgba(0, 0, 0, 0.5)',
  },
});
style.add = css({
  width: '215px',
  height: '452px',
  borderRadius: '4px 4px 0px 0px',
  border: ' 1px solid #f0f0f0',
  margin: '0 25px 15px 0',
  textAlign: 'center',
  fontWeight: 500,
  cursor: 'pointer',
  position: 'relative',
  [`&:hover .${style.mask}`]: {
    opacity: 1,
    background: 'rgba(0, 0, 0, 0.5)',
  },
});

export default style;
