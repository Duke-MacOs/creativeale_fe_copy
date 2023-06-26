import React, { useState, useRef, useContext, useEffect } from 'react';
import { Button, Input, Tooltip, Modal, Checkbox, message } from 'antd';
import { useDrop } from 'react-dnd';
import { isNil } from 'lodash';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import { Box, FileQuestion, Star, FolderClose, Delete, Edit } from '@icon-park/react';
import { updateCategoryOfUserMaterial, deleteUserMaterial } from '@shared/api/library';
import { usePersistCallback } from '@byted/hooks';
import { classnest } from '@editor/utils';
import { ICategoryItem, useCategory } from './useCategory';
import { UserMaterialContext } from '../context';
import { IUserMaterial } from '@/types/library';
import styles from '../style';

const DeleteModalContext = React.createContext(false);

interface ItemProps {
  category: ICategoryItem;
  isActive: boolean;
  editable: boolean;
  onSelect(id: ICategoryItem['id']): void;
}

export default function Item({ category, isActive, editable, onSelect }: ItemProps) {
  const {
    category: { list: categoryList, refreshList: refreshCategoryList, cancelAddCategory },
    library: { refreshList: refreshLibrary },
  } = useContext(UserMaterialContext);
  const { onUpdate, onDelete } = useCategory(category.id);
  const [tempName, setTempName] = useState(category.name);
  const [editing, setEditing] = useState(category.isNew ? true : false);
  const [saving, setSaving] = useState(false);
  const [hover, setHover] = useState(false);
  const [deleteAsEmpty, setEmpty] = useState(false);
  const deleteAsEmptyRef = useRef(false);
  const inputRef = useRef<any>(null);
  const scrollTargetRef = useRef<HTMLDivElement | null>(null);
  const inputWithComposition = useRef(false);
  const [modal, contextHolder] = Modal.useModal();
  const nameMaxLength = 10;
  const specialNameInfo = {
    [encodeURI('全部')]: {
      canDrop: false,
      icon: Box,
    },
    [encodeURI('未分类')]: {
      canDrop: false,
      icon: FileQuestion,
    },
    [encodeURI('我的收藏')]: {
      canDrop: true,
      icon: Star,
    },
    [encodeURI('回收站')]: {
      canDrop: true,
      icon: Delete,
    },
  };
  const encodeName = encodeURI(category.name);
  const TypeIcon = specialNameInfo[encodeName] ? specialNameInfo[encodeName].icon : FolderClose;
  const canDrop =
    !(specialNameInfo[encodeName] && !specialNameInfo[encodeName].canDrop) && !isActive && !isNil(category.id);

  const [{ isOver, isDanger }, dropRef] = useDrop<
    { type: 'resource'; sourceCategoryId: string; item: IUserMaterial },
    any,
    any
  >({
    accept: ['resource'],
    canDrop() {
      return canDrop;
    },
    drop(data) {
      const { item, sourceCategoryId } = data;
      if (category.id === '0') {
        const effectOther = item.categories.length > 1;
        Modal.confirm({
          title: '删除物料',
          icon: null,
          centered: true,
          content: effectOther ? '该物料属于多个分类，删除后同时会从其他分类下消失' : `您将删除“${item.name}”`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            deleteUserMaterial([item.id]).then(() => {
              refreshCategoryList();
              refreshLibrary();
              message.success(`成功删除“${item.name}”`);
            });
          },
        });
      } else {
        const targetId = category.id;
        if (!isNil(targetId)) {
          const categoryIds = item.categories.map(cat => cat.id).filter(id => id !== sourceCategoryId);
          updateCategoryOfUserMaterial([item.id], categoryIds.concat(targetId)).then(() => {
            message.success(`成功将${item.name}加入${category.name}`);
            onSelect(category.id);
            refreshCategoryList();
          });
        }
      }
    },
    collect(monitor) {
      const isOver = monitor.isOver();
      const canDrop = monitor.canDrop();
      return { isOver, isDanger: !canDrop };
    },
  });

  const handleClickItem = usePersistCallback(() => {
    if (editing || !category.id) return;
    onSelect(category.id);
  });
  const handleMouseEnterItem = usePersistCallback(() => {
    if (!specialNameInfo[encodeName] && editable) setHover(true);
  });
  const handleMouseLeaveItem = usePersistCallback(() => {
    setHover(false);
  });
  const handleInputBlur = usePersistCallback(() => {
    const trimmedName = tempName.trim();
    if (trimmedName.trim() === '' || category.name === tempName) {
      if (isNil(category.id)) {
        cancelAddCategory();
      }
      setEditing(false);
      return;
    }
    setSaving(true);
    onUpdate({ name: trimmedName })
      .then(id => {
        refreshCategoryList();
        return id;
      })
      .then(id => {
        if (id) onSelect(id);
        setEditing(false);
        setSaving(false);
      })
      .catch(e => {
        const repeated = (categoryList || []).find(cat => cat.name === trimmedName);
        message.error(repeated ? '该分类名已存在' : e.message);
        setSaving(false);
      });
  });
  const handleInputChange = usePersistCallback(e => {
    const val = e.currentTarget.value;
    if (!inputWithComposition.current && val.length > nameMaxLength) {
      setTempName(val.slice(0, nameMaxLength));
    } else {
      setTempName(val);
    }
  });
  const handleEdit = usePersistCallback(e => {
    e.stopPropagation();
    setEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  });
  const handleDelete = usePersistCallback(e => {
    e.stopPropagation();
    modal.confirm({
      title: '删除分类',
      icon: null,
      centered: true,
      content: (
        <DeleteModalContext.Consumer>
          {deleteAsEmpty => (
            <>
              <div className={styles.deleteCatModalContent}>您将删除{category.name}</div>
              <Checkbox
                checked={deleteAsEmpty}
                className={styles.deleteCatModalCheckbox}
                onChange={e => {
                  const checked = e.target.checked;
                  setEmpty(checked);
                  deleteAsEmptyRef.current = checked;
                }}
              >
                将分类中的物料同时丢进回收站
              </Checkbox>
            </>
          )}
        </DeleteModalContext.Consumer>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        onDelete(deleteAsEmptyRef.current)
          .then(() => {
            const list = categoryList || [];
            const idx = list.findIndex(cat => cat.id === category.id);
            if (idx >= 0 && isActive) {
              const targetIdx = idx < list.length - 1 ? idx + 1 : idx - 1;
              onSelect(list[targetIdx].id);
            }
            refreshCategoryList();
            message.success(
              `成功删除“${category.name}”${
                deleteAsEmptyRef.current ? ',以及该分类下的' + category.count + '个物料' : ''
              }`
            );
          })
          .catch(e => {
            message.error(e.message);
          });
      },
    });
  });

  useEffect(() => {
    if (isNil(category.id) && scrollTargetRef.current) {
      scrollTargetRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
      inputRef.current?.focus();
    }
  }, [category.id]);

  return (
    <>
      <div
        className={classnest({
          [styles.sidebarItem]: 1,
          active: isActive,
        })}
        ref={dropRef}
        onClick={handleClickItem}
        onMouseEnter={handleMouseEnterItem}
        onMouseLeave={handleMouseLeaveItem}
      >
        {editing || saving ? (
          <div className={styles.sidebarItemContent}>
            <TypeIcon className={styles.sidebarIcon} theme="outline" />
            <div ref={scrollTargetRef} className={styles.sidebarItemLeft}>
              <Input
                ref={inputRef}
                placeholder="请输入分类名称"
                className={styles.sidebarInput}
                value={tempName}
                maxLength={nameMaxLength}
                suffix={
                  saving ? (
                    <LoadingOutlined />
                  ) : (
                    <span className={styles.stringLength}>
                      {tempName.length}/{nameMaxLength}
                    </span>
                  )
                }
                onBlur={handleInputBlur}
                onChange={handleInputChange}
                onCompositionStart={() => (inputWithComposition.current = true)}
                onCompositionEnd={() => (inputWithComposition.current = false)}
              />
            </div>
          </div>
        ) : (
          <div
            className={classnest({
              [styles.sidebarItemContent]: 1,
              hover: isOver && !isDanger,
              dangerHover: isOver && isDanger && !isActive,
            })}
          >
            <div className={styles.sidebarItemLeft}>
              <TypeIcon className={styles.sidebarIcon} theme="outline" />
              <span className={styles.sidebarTitle}>{category.name}</span>
            </div>
            {hover ? (
              <div style={{ marginRight: '-8px' }}>
                <Tooltip placement="top" title="编辑">
                  <Button
                    type="link"
                    className={styles.sidebarBtn}
                    icon={<Icon component={Edit as any} />}
                    onClick={handleEdit}
                  />
                </Tooltip>

                <Tooltip placement="top" title="删除">
                  <Button
                    type="link"
                    className={styles.sidebarBtn}
                    icon={<Icon component={Delete as any} />}
                    onClick={handleDelete}
                  />
                </Tooltip>
              </div>
            ) : (
              <div className={styles.sidebarNum}>{category.count}</div>
            )}
          </div>
        )}
      </div>
      <DeleteModalContext.Provider value={deleteAsEmpty}>{contextHolder}</DeleteModalContext.Provider>
    </>
  );
}
