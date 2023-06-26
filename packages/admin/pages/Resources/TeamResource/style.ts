import { css } from 'emotion';
const primaryColor = '#3955f6';

const styles1 = {
  sidebarItem: css({
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
    height: '46px',
    fontSize: '14px',
    cursor: 'pointer',
    // '&:hover': {
    //   color: primaryColor,
    //   backgroundColor: '#eef3fe',
    // },
    '&.active': {
      color: primaryColor,
      backgroundColor: '#eef3fe',
    },
  }),
};

const styles2 = {
  wrapper: css({
    minHeight: '100%',
    flex: 'auto',
  }),
  filterWrapper: css({
    padding: '16px 30px',
    '& .ant-form-item': {
      marginBottom: 0,
    },
    '& .ant-input-search-button': {},
    '& .ant-select-selector': {
      padding: '2px 4px',
    },
    '& .ant-form-item-label > label': {
      height: '34px',
      lineHeight: '34px',
    },
    '& .ant-input': {
      padding: '5px 11px',
    },
    '& .anticon-search': {
      transform: 'scale(0.85)',
    },
  }),
  filterLabel: css({
    color: '#999',
  }),
  container: css({
    margin: '0 auto',
    padding: '16px',
  }),
  content: css({
    position: 'relative',
    display: ' flex',
    margin: '0 50px',
    maxWidth: '1248px',
    minWidth: '1180px',
    minHeight: '1501px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    borderRadius: '4px',
  }),
  sidebarWrapper: css({
    flex: '0 0 252px',
    width: '252px',
    borderRight: '1px solid #ebebeb',
  }),
  sidebar: css({
    position: 'sticky',
    top: 0,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
  }),
  sidebarHeader: css({
    height: '55px',
    borderBottom: '1px solid #ebebeb',
    '& .ant-btn': {
      padding: '0 16px',
      width: '100%',
      lineHeight: '55px',
      fontSize: '14px',
      textAlign: 'left',
      fontWeight: 'bold',
    },
  }),
  sidebarList: css({
    flex: 1,
    paddingTop: '8px',
    overflowY: 'hidden',
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#e8e8e8',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&:hover': {
      paddingRight: 0,
      overflowY: 'scroll',
      ['& .' + styles1.sidebarItem]: {
        paddingRight: '4px',
      },
    },
  }),
  sidebarItemContent: css({
    display: 'flex',
    alignItems: 'center',
    padding: '5px 8px',
    width: '100%',
    border: '1px solid transparent',
    borderRadius: '4px',
    '&.hover': {
      borderColor: primaryColor,
      backgroundColor: '#eef3fe',
      color: primaryColor,
    },
    '&.dangerHover': {
      borderColor: '#ff4538',
      backgroundColor: '#ffeceb',
    },
  }),
  sidebarItemLeft: css({
    flex: 1,
    width: 0,
    display: 'flex',
    alignItems: 'center',
  }),
  sidebarNum: css({}),
  sidebarInput: css({
    marginLeft: '2%',
    width: '98%',
  }),
  sidebarBtn: css({
    fontSize: '18px',
    color: '#333',
    '&:hover': {
      color: primaryColor,
    },
  }),
  sidebarTitle: css({
    marginLeft: '10px',
  }),
  sidebarIcon: css({
    fontSize: '16px',
    lineHeight: '11px',
  }),
  deleteCatModalContent: css({
    padding: '16px 0',
    color: '#666',
  }),
  deleteCatModalCheckbox: css({
    color: '#666',
  }),
  optionBar: css({
    padding: '24px 32px',
  }),
  optionCheckbox: css({
    marginRight: '24px',
  }),
  optionButton: css({
    marginRight: '24px',
    padding: '5px 15px',
    height: '34px',
  }),
  optionTipsTrigger: css({
    color: '#999',
    '&:hover': {
      color: primaryColor,
    },
  }),
  uploadMenuItem: css({
    display: 'flex',
    width: '258px',
  }),
  updateMenuTitle: css({
    flex: '0 0 72px',
    width: '72px',
  }),
  uploadMenuDesc: css({
    flex: 1,
    paddingLeft: '8px',
    borderLeft: '1px solid #ebebeb',
    fontSize: '12px',
    color: '#999',
  }),
  list: css({
    display: 'flex',
    flexWrap: 'wrap',
    padding: '0 32px 8px',
    fontSize: 0,
  }),
  item: css({
    position: 'relative',
    marginRight: '16px',
    marginBottom: '16px',
    flex: 1,
    maxWidth: '221px',
    minWidth: '200px',
    height: '255px',
    // background: '#fff',
    border: '1px solid #ebebeb',
    borderRadius: '4px',
    overflow: 'hidden',
    '&:nth-child(4n+4)': {
      marginRight: 0,
    },
  }),
  itemDragBox: css({
    position: 'absolute',
    top: 0,
    bottom: '45px',
    left: 0,
    right: 0,
  }),
  itemPreview: css({
    position: 'absolute',
    top: 0,
    bottom: '45px',
    left: 0,
    right: 0,
    backgroundColor: '#F2F4F7',
  }),
  itemTag: css({
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '0 8px',
    borderRadius: '4px 0 4px 0',
    backgroundColor: primaryColor,
    lineHeight: '20px',
    fontSize: '12px',
    color: '#fff',
  }),
  itemCheckbox: css({
    position: 'absolute',
    top: '8px',
    right: '8px',
  }),
  itemPoster: css({
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  }),
  itemFooter: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    height: '45px',
    overflow: 'hidden',
  }),
  itemId: css({
    marginRight: '4px',
    padding: '0 4px',
    lineHeight: '20px',
    backgroundColor: '#F0F0F0',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  }),
  itemIdTips: css({
    fontSize: '12px',
    '& .ant-btn-sm': {
      fontSize: '12px',
    },
  }),
  itemName: css({
    lineHeight: '20px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  itemOptions: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 99,
    '& .ant-btn': {
      padding: '5px 8px',
    },
  }),
  modalFooter: css({
    padding: '14px 0',
    display: 'flex',
    alignItems: 'center',
  }),
  modalFooterTips: css({
    flex: 1,
    textAlign: 'left',
    color: '#999',
  }),
  stringLength: css({
    color: '#c1c1c1',
    pointerEvents: 'none',
  }),
  copyInput: css({
    position: 'absolute',
    top: 0,
    left: '-10px',
    padding: '0',
    width: '10px',
    height: '100%',
    fontSize: '12px',
    opacity: 0,
  }),
  pagination: css({
    padding: '0 32px 32px',
    textAlign: 'right',
    '& .ant-pagination-item': {
      minWidth: '26px',
      height: '26px',
      lineHeight: '24px',
      fontSize: '12px',
    },
    '& .ant-pagination-prev, & .ant-pagination-next, & .ant-pagination-jump-prev, & .ant-pagination-jump-next': {
      minWidth: '26px',
      height: '26px',
      lineHeight: '24px',
    },
    '& .ant-select-single:not(.ant-select-customize-input) .ant-select-selector': {
      height: '26px',
    },
    '& .ant-select-single:not(.ant-select-customize-input) .ant-select-selector .ant-select-selection-search-input': {
      height: '24px',
    },
    '& .ant-select-selection-item': {
      lineHeight: '24px!important',
      fontSize: '12px!important',
    },
    '& .ant-pagination-options-quick-jumper': {
      height: '26px',
      lineHeight: '26px',
    },
    '& .ant-pagination-options-quick-jumper input': {
      height: '26px',
      lineHeight: '26px',
      fontSize: '12px',
    },
    '& .ant-pagination-total-text': {
      marginRight: '16px',
      height: '26px',
      lineHeight: '26px',
    },
  }),
  modalWrapper: css({
    '& .ant-modal-body': {
      paddingTop: '24px',
    },
    '& .ant-modal-close': {
      top: '5px',
    },
    '& .ant-modal-confirm-content': {
      marginTop: '24px',
      color: '#666',
    },
    '& .ant-modal-confirm-btns': {
      marginTop: '32px',
    },
  }),
};

export default { ...styles1, ...styles2 };
