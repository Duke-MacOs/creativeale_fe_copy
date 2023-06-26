import React, { useEffect, useRef, useState } from 'react';
import Cropper from '../UploadFiles/Modal/Cropper';
import { Button, Modal, Tooltip } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getDims } from '../accepted';
interface ModalProps {
  fileList: File[];
  onFinish: (scale: any) => void;
}

export default ({ fileList, onFinish }: ModalProps) => {
  const cropperRef = useRef<HTMLImageElement>(null);
  const [src, setSrc] = useState<any>('');
  const [scaleCount, setScaleCount] = useState<number>(1);
  const [info, setInfo] = useState<any>({});
  useEffect(() => {
    const reader = new FileReader();
    reader.onload = function () {
      setSrc(reader.result);
    };
    reader.readAsDataURL(fileList[0]);
  }, [fileList]);

  useEffect(() => {
    const imageElement: any = cropperRef?.current;
    const cropper: any = imageElement?.cropper;
    cropper.scale(scaleCount);
    getDims(fileList[0]).then(data => {
      const width = data.width;
      const height = data.height;
      const frameSize = fileList.reduce((total, file) => total + file.size, 0);
      const currentWidth = Math.round(width * scaleCount);
      const currentHeight = Math.round(height * scaleCount);
      const currentFrameSize = frameSize * scaleCount;
      setInfo({
        size: `${width} * ${height}`,
        currentWidth: currentWidth,
        currentHeight: currentHeight,
        currentSize: `${currentWidth} * ${currentHeight}`,
        frameSize: (frameSize / 1024 / 1024).toFixed(2),
        currentFrameSize: (currentFrameSize / 1024 / 1024).toFixed(2),
      });
    });
  }, [fileList, scaleCount]);

  return (
    // 裁剪模态框
    <Modal
      className="upload_cropper_modal"
      open={true}
      centered
      width={820}
      onCancel={() => {
        Modal.destroyAll();
      }}
      bodyStyle={{ padding: '0 20px 10px 20px' }}
      title="请修改图片缩放值"
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
            {/* 缩小 */}
            <Tooltip placement="bottom" title="缩小">
              <Button
                icon={<MinusCircleOutlined />}
                type="text"
                onClick={() => {
                  setScaleCount(0.8 * scaleCount);
                }}
              />
            </Tooltip>
            {/* 放大 */}
            <Tooltip placement="bottom" title="放大">
              <Button
                icon={<PlusCircleOutlined />}
                type="text"
                onClick={() => {
                  setScaleCount(1.25 * scaleCount);
                }}
              />
            </Tooltip>
            {/* 重置 */}
            <Tooltip placement="bottom" title="重置">
              <Button
                icon={<StopOutlined />}
                type="text"
                onClick={() => {
                  setScaleCount(1);
                  const imageElement: any = cropperRef?.current;
                  const cropper: any = imageElement?.cropper;
                  cropper.reset();
                }}
              />
            </Tooltip>
          </div>
          <div style={{ display: 'flex', fontSize: '12px', justifyContent: 'space-around', width: '50%' }}>
            <div>
              <div>原尺寸：{info.size}</div>
              <div style={{ color: info.currentWidth * info.currentHeight > 512 * 512 ? 'red' : '' }}>
                当前尺寸：{info.currentSize}
              </div>
            </div>
            <div>
              <div>原序列帧大小：{info.frameSize}M</div>
              <div style={{ color: info.currentFrameSize > 2 ? 'red' : '' }}>
                当前序列帧大小：{info.currentFrameSize}M
              </div>
            </div>
            <Button
              type="primary"
              disabled={info.currentWidth * info.currentHeight > 512 * 512 || info.currentFrameSize > 2}
              onClick={() => {
                onFinish(scaleCount.toFixed(2));
                Modal.destroyAll();
              }}
            >
              确定
            </Button>
          </div>
        </div>,
      ]}
    >
      <Cropper
        cropperRef={cropperRef}
        src={src} // 图片路径，即是base64的值，在Upload上传的时候获取到的
        viewMode={0} // 定义cropper的视图模式
      />
    </Modal>
  );
};
