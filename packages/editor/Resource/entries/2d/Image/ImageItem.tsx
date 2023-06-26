import React, { useState, useCallback, useEffect } from 'react';
import { Input, message, Modal, Tooltip } from 'antd';
import { css, cx } from 'emotion';
import useDraggable from '../../../common/useDraggable';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import { Delete, Edit, Plus, Star, Download, Save } from '@icon-park/react';
import Button from 'antd/es/button';
import { classnest, downloadBlob } from '../../../../utils';
import { UploadFiles, UploadFilesProps } from '../../../upload';
import { Category, Provider, useEmitter } from '@editor/aStore';
import useRenameResourceEntry from '@editor/Resource/common/useRenameResourceEntry';
import Axios from 'axios';
import { useScene } from '@editor/Editor/Scenes/hooks/useScene';
import useCubemap from '../../3d/Cubemaps/useCubemap';

const className = css({
  width: '72px',
  height: '72px',
  borderRadius: '2px',
  backgroundRepeat: 'no-repeat',
  border: '1px solid #f0f0f0',
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: '#F5F5F5',
  cursor: 'pointer',
  justifySelf: 'center',
  display: 'flex',
});
const iconClassName = css({
  opacity: 0,
  margin: 2,
  [`.${className}:hover &, &-loading`]: {
    opacity: 1,
  },
  '&.ant-btn-icon-only.ant-btn-sm': {
    width: '16px',
    height: '16px',
    lineHeight: '8px',
    fontSize: '8px',
    '& > *': {
      fontSize: '8px',
    },
  },
});
const versionTagClassName = css({
  marginTop: '2px',
  marginRight: '2px',
  padding: '0 3px',
  borderRadius: '4px',
  backgroundColor: '#3955f6',
  color: '#fff',
});
const FilledStar = (props: any) => <Star theme="filled" {...props} fill="#F6A304" />;
export interface ImageItemProps {
  isFavored?: boolean;
  category: Category;
  cover?: string;
  extra?: Record<string, any>;
  props?: Record<string, any>;
  name: string;
  url: string | number;
  materialId?: string | number;
  description?: string;
  version?: string | null;
  provider?: Provider;
  onChangeName?: (name: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onFavor?: (toFavor: boolean) => Promise<void>;
  onEdit?: () => void;
  groupData?: any;
  setGroupData?: any;
  onSaveAs?: () => Promise<void>;
  resourceUrl?: string;
  orderId?: number;
}
export function ImageItem({
  isFavored,
  category,
  props,
  cover,
  name,
  url,
  extra,
  version,
  description,
  materialId,
  provider,
  orderId,
  onDelete,
  onFavor,
  onEdit,
  groupData,
  setGroupData,
  onSaveAs,
  resourceUrl,
}: ImageItemProps) {
  const [deleting, setDeleting] = useState(false);
  const [favoring, setFavoring] = useState(false);
  const [newName, setNewName] = useState<string>(name);
  const [ifRename, setIfRename] = useState(false);
  const refInput = React.useRef<any>(null);
  const onRenameResourceEntry = useRenameResourceEntry();
  const { updateCubemap } = useCubemap();
  const { onChangeSceneName } = useScene();
  const componentProps = useDraggable({
    mime: category,
    url,
    name,
    cover,
    props,
    version,
    materialId,
    provider,
    extra,
    orderId,
  });

  const onViewResource = useEmitter('ViewResource');
  const handleMouseEnter = useCallback(() => {
    onViewResource({
      type: 'enter',
      category,
      url,
      name,
      description,
      extra,
    });
  }, [onViewResource, category, url, name, description, extra]);
  const handleMouseLeave = useCallback(() => {
    onViewResource({
      type: 'leave',
    });
  }, [onViewResource]);
  useEffect(() => handleMouseLeave, [handleMouseLeave]);
  const onRename = async () => {
    if (newName !== name && newName !== '') {
      if (['Animation', 'Animation3D', 'Model', 'Particle3D'].includes(category)) {
        onChangeSceneName(Number(materialId), newName);
      } else if (category === 'Cubemaps') {
        updateCubemap(orderId as number, { name: newName });
      } else {
        await onRenameResourceEntry(category, provider!, materialId!, newName, setGroupData, groupData);
      }
    }
    setIfRename(false);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseLeave}
    >
      <div
        className={cx(className, category === 'Particle')}
        style={{
          backgroundImage: `url(${
            cover || 'https://sf3-cdn-tos.douyinstatic.com/obj/eden-cn/bqaeh7vhobd/feedback.svg'
          })`,
          ...(category === 'Particle'
            ? {
                backgroundSize: 'cover',
              }
            : {}),
        }}
        {...componentProps}
      >
        {onFavor && (
          <Button
            type="primary"
            size="small"
            onClick={event => {
              event.stopPropagation();
              setFavoring(true);
              onFavor(!isFavored).finally(() => {
                setFavoring(false);
              });
            }}
            loading={favoring}
            className={classnest({ [iconClassName]: { loading: favoring } })}
            icon={<Icon component={(isFavored ? FilledStar : Star) as any} />}
          />
        )}
        <div style={{ flex: 'auto' }} />
        {onSaveAs && (
          <Button
            type="primary"
            size="small"
            onClick={event => {
              event.stopPropagation();
              onSaveAs();
            }}
            className={iconClassName}
            icon={<Icon component={Save as any} />}
          />
        )}
        {onEdit && (
          <Button
            type="primary"
            size="small"
            onClick={event => {
              event.stopPropagation();
              onEdit();
            }}
            className={iconClassName}
            icon={<Icon component={Edit as any} />}
          />
        )}
        {!['Animation', 'FrameAnime', 'Model', 'Particle3D', 'Animation3D', 'Texture2D', 'Cubemaps'].includes(
          category
        ) && (
          <Button
            type="primary"
            size="small"
            className={iconClassName}
            icon={<Icon component={Download as any} />}
            onClick={event => {
              event.stopPropagation();
              const uri = resourceUrl ? `${resourceUrl}` : `${url}`;
              const index = uri.lastIndexOf('.');
              let ext = '';
              ext = uri.substr(index + 1);
              if (uri.includes('zip')) {
                ext = 'zip';
              }
              Axios({ url: `${uri}?forceDownload=true`, responseType: 'blob' })
                .then(res => {
                  downloadBlob(res.data, `${name}.${ext}`);
                })
                .catch(() => {
                  message.error('下载失败');
                });
            }}
          />
        )}
        {onDelete && (
          <Button
            danger
            type="primary"
            size="small"
            onClick={event => {
              event.stopPropagation();
              Modal.confirm({
                title: `确定删除${name}吗？`,
                okText: '确定',
                cancelText: '取消',
                onOk() {
                  setDeleting(true);
                  onDelete()
                    .then(() => {
                      setDeleting(false);
                    })
                    .catch(e => {
                      message.error(e.message);
                      setDeleting(false);
                    });
                },
              });
            }}
            loading={deleting}
            className={classnest({ [iconClassName]: { loading: deleting } })}
            icon={<Icon component={Delete as any} />}
          />
        )}
      </div>
      <div
        title={name}
        onDoubleClick={event => {
          event.stopPropagation();
          setIfRename(true);
        }}
        style={{
          ...(category === 'Animation'
            ? {
                cursor: 'pointer',
              }
            : {}),
          fontSize: 11,
          textAlign: 'center',
          color: 'gray',
          whiteSpace: 'nowrap',
          width: '72px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {version && <span className={versionTagClassName}>{version}</span>}
        {ifRename ? (
          <Input
            ref={refInput}
            type="text"
            defaultValue={name}
            autoFocus
            style={{ fontSize: 11, height: '20px' }}
            onChange={e => {
              setNewName(e.target.value);
            }}
            onBlur={onRename}
            onPressEnter={onRename}
          />
        ) : (
          <Tooltip title={name} placement="bottom">
            <div>{name}</div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export const withUploading = <
  T extends Pick<UploadFilesProps, 'children' | 'className' | 'setUploading' | 'uploading' | 'acceptFiles'>
>(
  Component: React.ComponentType<T>
) => {
  return (props: Omit<T, 'children' | 'className' | 'setUploading' | 'uploading'> & { category: Category }) => {
    const [uploading, setUploading] = useState(false);
    return (
      <Component
        uploading={uploading}
        className={css({ justifySelf: 'center' })}
        setUploading={setUploading}
        {...(props as any)}
      >
        <div
          className={className}
          style={{
            background: '#eef3fe',
            display: 'flex',
            justifyContent: 'center',
            color: '#3955f6',
            alignItems: 'center',
            fontSize: '1.62em',
          }}
        >
          <Icon component={uploading ? LoadingOutlined : (Plus as any)} />
        </div>
      </Component>
    );
  };
};

export const ImageUpload = withUploading(UploadFiles);
