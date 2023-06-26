import React, { useRef, useState } from 'react';
import Cropper from './Cropper';
import { Button, message, Modal, Tooltip } from 'antd';
import {
  CheckOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  RedoOutlined,
  StopOutlined,
  UndoOutlined,
} from '@ant-design/icons';
interface ModalProps {
  cropResource: {
    name: unknown;
    url: string;
  };
  onCancel: () => void;
  onConfirm: (blob: any, type: string) => Promise<void>;
}

export default ({ cropResource, onCancel, onConfirm }: ModalProps) => {
  const cropperRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<string>(cropResource.url);
  const [wait, setWait] = useState<boolean>(false);
  const [quality, setQuality] = useState<number>(0.8);
  const type = cropResource.url.includes('.png') ? 'png' : 'jpeg';

  const upload = async () => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    setWait(true);
    cropper.disable();
    cropper
      .getCroppedCanvas({
        minWidth: 0,
        minHeight: 0,
      })
      ?.toBlob(
        async (blob: Blob) => {
          if (blob) {
            await onConfirm(blob, type);
          } else {
            message.error('裁剪区域图片尺寸小于1*1，无法裁剪');
          }
          setWait(false);
          cropper.enable();
        },
        `image/${type}`,
        quality
      );
  };

  return (
    // 裁剪模态框
    <Modal
      className="upload_cropper_modal"
      open={true}
      width={820}
      onCancel={onCancel}
      bodyStyle={{ padding: '0 20px 10px 20px' }}
      title="请选择剪裁区域"
      footer={[
        <div
          style={{
            width: '100%',
            height: '20px',
            margin: '5px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
          }}
        >
          <div>
            操作：
            {/* 放大 */}
            <Tooltip placement="bottom" title="放大">
              <Button
                icon={<PlusCircleOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.zoom(0.1);
                }}
              />
            </Tooltip>
            {/* 缩小 */}
            <Tooltip placement="bottom" title="缩小">
              <Button
                icon={<MinusCircleOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.zoom(-0.1);
                }}
              />
            </Tooltip>
            {/* 左旋转 */}
            <Tooltip placement="bottom" title="向左旋转">
              <Button
                icon={<UndoOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.rotate(-90);
                }}
              />
            </Tooltip>
            {/* 右旋转 */}
            <Tooltip placement="bottom" title="向右旋转">
              <Button
                icon={<RedoOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.rotate(90);
                }}
              />
            </Tooltip>
            {/* 确定 */}
            <Tooltip placement="bottom" title="确定">
              <Button
                icon={<CheckOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  const img = cropper.getCroppedCanvas();
                  if (img.width < 1 || img.height < 1) {
                    message.error('裁剪区域图片尺寸小于1*1，无法裁剪');
                  } else {
                    setSrc(img.toDataURL());
                  }
                }}
              />
            </Tooltip>
            {/* 重置 */}
            <Tooltip placement="bottom" title="重置">
              <Button
                icon={<StopOutlined />}
                type="text"
                onClick={() => {
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.reset();
                  setSrc(cropResource.url);
                }}
              />
            </Tooltip>
          </div>
          <div>
            压缩质量：
            <Button
              type={quality === 0.8 ? 'link' : 'text'}
              onClick={() => {
                const imageElement: any = cropperRef?.current;
                const cropper: any = imageElement?.cropper;
                setQuality(0.8);
                setSrc(cropper.getCroppedCanvas().toDataURL(0.8));
              }}
            >
              高
            </Button>
            <Button
              type={quality === 0.6 ? 'link' : 'text'}
              onClick={() => {
                const imageElement: any = cropperRef?.current;
                const cropper: any = imageElement?.cropper;
                setQuality(0.6);
                setSrc(cropper.getCroppedCanvas().toDataURL(0.6));
              }}
            >
              中
            </Button>
            <Button
              type={quality === 0.4 ? 'link' : 'text'}
              onClick={() => {
                const imageElement: any = cropperRef?.current;
                const cropper: any = imageElement?.cropper;
                setQuality(0.4);
                setSrc(cropper.getCroppedCanvas().toDataURL(0.4));
              }}
            >
              低
            </Button>
          </div>
          <Button type="primary" loading={wait} onClick={upload}>
            确定
          </Button>
        </div>,
      ]}
    >
      <Cropper
        cropperRef={cropperRef}
        src={src} // 图片路径，即是base64的值，在Upload上传的时候获取到的
        viewMode={1} // 定义cropper的视图模式
      />
    </Modal>
  );
};
