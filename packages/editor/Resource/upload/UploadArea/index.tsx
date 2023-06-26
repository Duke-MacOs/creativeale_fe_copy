import React, { useState, memo } from 'react';
import { Button, Empty } from 'antd';
import { useDispatch } from 'react-redux';
import { css } from 'emotion';
import { InboxOutlined, LoadingOutlined } from '@ant-design/icons';
import { UploadFiles } from '@editor/Resource/upload';
import { useAddNode } from '@editor/aStore';
import { changeCategory } from '../../../aStore';
import { onMacOS } from '../../../utils';
const className = css({
  gridColumnStart: 1,
  gridColumnEnd: 'span 2',
  height: '100%',
  padding: 8,
});
export const EmptyArea = memo(() => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有搜索结果" className={className} />
));
export const UploadArea = memo(() => {
  const [uploading, setUploading] = useState(false);
  const onAddNode = useAddNode();
  const dispatch = useDispatch();
  return (
    <div className={className}>
      <UploadFiles
        onAddResourceEntry={onAddNode}
        setUploading={setUploading}
        uploading={uploading}
        isTeam={false}
        dragger
      >
        <p className="ant-upload-drag-icon">{uploading ? <LoadingOutlined /> : <InboxOutlined />}</p>
        <p className="ant-upload-text">
          点击或拖到此区域上传文件、打开
          <Button
            type="link"
            size="large"
            disabled={uploading}
            onClick={event => {
              event.stopPropagation();
              dispatch(changeCategory('Sprite'));
            }}
            style={{
              padding: 2,
            }}
          >
            资源面板
          </Button>
          进行添加，或 {onMacOS('Cmd', 'Ctrl')} + V 从剪切板直接添加
        </p>
        <p className="ant-upload-hint">支持图片、声音、视频、粒子(.plist)、Lottie(.json)</p>
      </UploadFiles>
    </div>
  );
});
