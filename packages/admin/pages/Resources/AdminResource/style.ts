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
  }),
  filterWrapper: css({
    padding: '16px 30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '1230px',
    width: '100%',
    position: 'relative',
    // background: '#fff',
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
  headerWrapper: css({
    width: '90%',
  }),
  filterLabel: css({
    color: '#999',
    width: '60px',
  }),
  section: css({
    borderBottom: '1px solid #EEE',
    userSelect: 'none',
    width: '95%',
    margin: '5px 0',
    '&:last-child': {
      borderBottom: 'none',
    },
  }),
  container: css({
    margin: '0 auto',
    padding: '16px',
  }),
  content: css({
    position: 'relative',
    display: ' flex',
    margin: '0 auto',
    minWidth: '1208px',
    minHeight: '1501px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    borderRadius: '4px',
    flexFlow: 'row wrap',
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
    margin: '0 2%',
    marginBottom: '20px',
    minWidth: '230px',
    height: '270px',
    // background: '#fff',
    border: '1px solid #ebebeb',
    borderRadius: '4px',
    overflow: 'hidden',
    flex: '0 0 16%',
  }),
  itemPreview: css({
    position: 'absolute',
    top: 0,
    bottom: '60px',
    left: 0,
    right: 0,
    backgroundColor: '#F2F4F7',
  }),
  itemCatTag: css({
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '0 8px',
    borderRadius: '4px 0 4px 0',
    backgroundColor: 'rgba(49, 72, 136, .6)',
    lineHeight: '20px',
    fontSize: '12px',
    color: '#fff',
  }),
  statusTag: css({
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding: '0 8px',
    borderRadius: '4px 0 4px 0',
    backgroundColor: 'rgba(57, 85, 246,.8)',
    lineHeight: '20px',
    fontSize: '12px',
    color: '#fff',
  }),
  itemCheckbox: css({
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 10,
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
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: '0 12px',
    height: '60px',
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
    width: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  editItemName: css({
    lineHeight: '20px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '180px',
    border: '1px solid #2f4f7',
  }),
  itemOptions: css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '& .ant-btn': {
      padding: '5px 0px',
    },
  }),
  itemTags: css({
    lineHeight: '20px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    position: 'relative',
    width: '100%',
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

  row: css({
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px 10px',
  }),
  label: css({
    width: 60,
  }),
  items: css({
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
  }),
  searchBox: css({
    width: 200,
    display: 'flex',
    alignItems: 'center',
  }),
  addButton: css({
    margin: '10px',
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
  select: css({
    maxHeight: '50px',
    color: '#333333',
    marginTop: '0',
    '& .ant-select-selector': {
      paddingRight: '0px !important',
    },
    '& .ant-select-selection-overflow': {
      maxHeight: '50px',
      overflow: 'auto',
      width: '100%',
    },
  }),
};

export default { ...styles1, ...styles2 };
