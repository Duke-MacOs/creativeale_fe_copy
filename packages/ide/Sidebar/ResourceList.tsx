import { useState, useRef, useMemo, useEffect } from 'react';
import { Input, Dropdown, Menu, Modal, message, InputRef } from 'antd';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { FileCode } from '@icon-park/react';
import { classnest } from '@editor/utils';
import { IdeState } from '@webIde/index';
import { switchTab, ITabState } from '@webIde/store';
import useRenameTab from './hooks/useRenameTab';
import useDeleteTab from './hooks/useDeleteTab';
import { css } from 'emotion';
import History from '../History';
import Tag from '../Tag';
import useDiffEditor from '../hooks/useDiffEditor';

const styles = {
  item: css({
    position: 'relative',
    padding: '8px 16px',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#272822',
    },
  }),
  itemActive: css({
    backgroundColor: '#404238!important',
    color: '#8496fb',
  }),
  itemIcon: css({
    marginRight: '4px',
    lineHeight: '11px',
    verticalAlign: 'sub',
    fontSize: '18px',
  }),
  itemInput: css({
    padding: '0 4px',
    width: '160px',
    backgroundColor: '#53546d !important',
    borderRadius: 0,
    color: '#fff',
  }),
  tipsDot: css({
    position: 'absolute',
    top: '50%',
    right: '16px',
    marginTop: '-3px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'rgba(206, 17, 38, 0.5)',
  }),
  tipsModify: css({
    position: 'absolute',
    top: '8px',
    right: '16px',
    fontSize: '12px',
    lineHeight: '20px',
    color: '#fdf8c8',
  }),
  tipsReadOnly: css({
    position: 'absolute',
    top: '8px',
    right: '16px',
    fontSize: '12px',
    color: '#777',
  }),
  contextMenu: css({
    '& .ant-dropdown-menu': {
      paddingTop: '2px',
      paddingBottom: '2px',
      backgroundColor: '#333',
      borderRadius: 0,
      border: '1px solid #555',
      width: '120px',
      boxShadow: '0 0 6px 6px rgb(0 0 0 / 10%)',
    },
    '& .ant-dropdown-menu-item': {
      padding: '2px 12px',
      color: '#fff',
      fontSize: '12px',
    },
    '& .ant-dropdown-menu-item-active': {
      backgroundColor: '#3955f6',
    },
  }),
  container: (visible: boolean) =>
    css({
      height: '100%',
      display: visible ? 'flex' : 'none',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }),
  list: css({
    flex: 1,
    overflowY: 'scroll',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  }),
};

function Item({ data }: { data: ITabState }) {
  const { currentTab, readOnly } = useSelector(
    (state: IdeState) => ({
      currentTab: state.ide.workspace.currentTab,
      readOnly: state.ide.workspace.readOnly,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const onRename = useRenameTab();
  const onDelete = useDeleteTab();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(data.name.split('.')[0]);
  const [hasModified, setHasModified] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const suffix = useMemo(() => {
    return data.name.split('.').pop();
  }, [data.name]);

  const menu = useMemo(() => {
    return (
      <Menu>
        <Menu.Item
          key="rename"
          onClick={() => {
            setEditing(true);
            setTimeout(() => inputRef.current?.focus(), 200);
          }}
        >
          重命名
        </Menu.Item>
        <Menu.Item
          key="delete"
          onClick={() => {
            Modal.confirm({
              content: `确认删除${data.name}吗`,
              centered: true,
              onOk: () => {
                onDelete(data);
              },
            });
          }}
        >
          删除
        </Menu.Item>
      </Menu>
    );
  }, [data, onDelete]);

  useEffect(() => {
    if (data.needsSave && !hasModified) {
      setHasModified(true);
    }
  }, [data.needsSave, hasModified]);

  const content = (
    <div
      key={data.id}
      className={classnest({
        [styles.item]: 1,
        [styles.itemActive]: data.id === currentTab,
      })}
      onClick={() => dispatch(switchTab(data.id))}
      onDoubleClick={() => {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }}
    >
      <FileCode className={styles.itemIcon} theme="outline" />
      {editing ? (
        <Input
          className={styles.itemInput}
          value={inputValue}
          ref={inputRef}
          bordered={false}
          onClick={e => e.stopPropagation()}
          onChange={e => {
            const val = e.currentTarget.value;
            setInputValue(val);
          }}
          onBlur={() => {
            onRename(data, `${inputValue}.${suffix}`)
              .then(() => setEditing(false))
              .catch(err => {
                message.error(err.message);
              });
          }}
        />
      ) : (
        data.name
      )}
      {data.id === currentTab && readOnly && <div className={styles.tipsReadOnly}>只读</div>}
      {data.needsSave ? (
        <div className={styles.tipsDot} />
      ) : hasModified ? (
        <div className={styles.tipsModify}>M</div>
      ) : null}
    </div>
  );

  if (readOnly) {
    return content;
  }
  return (
    <Dropdown overlayClassName={styles.contextMenu} overlay={menu} trigger={['contextMenu']} placement="bottomLeft">
      {content}
    </Dropdown>
  );
}

export function ResourceList({ data, visible }: { data: ITabState[]; visible: boolean }) {
  const { createDiffEditor } = useDiffEditor();
  const currentTab = useSelector((state: IdeState) => state.ide.workspace.currentTab, shallowEqual);
  useEffect(() => {
    document.title = data.find(i => i.id === currentTab)?.name ?? data[0]?.name ?? '脚本编辑器';
  }, [currentTab, data]);
  return (
    <div className={styles.container(visible)}>
      <div className={styles.list}>
        {data.map(nav => {
          return <Item key={nav.id} data={nav} />;
        })}
      </div>
      <Tag createDiffEditor={createDiffEditor} />
      <History createDiffEditor={createDiffEditor} />
    </div>
  );
}
