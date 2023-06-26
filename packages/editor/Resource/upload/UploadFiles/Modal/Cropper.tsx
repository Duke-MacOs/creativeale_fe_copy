import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';
interface ModalProps {
  cropperRef: React.RefObject<HTMLImageElement>;
  src: string;
  viewMode: number;
}

export default ({ cropperRef, src, viewMode }: ModalProps) => {
  return (
    <Cropper
      ref={cropperRef}
      src={src} // 图片路径，即是base64的值，在Upload上传的时候获取到的
      viewMode={viewMode as any} // 定义cropper的视图模式
      zoomable={true} // 是否允许放大图像
      movable
      background={true} // 是否显示背景的马赛克
      rotatable={true} // 是否旋转
      style={{ width: '100%', height: '400px' }}
      cropBoxResizable={true} // 默认true ,是否允许拖动 改变裁剪框大小
      dragMode="move" // 拖动模式, 默认crop当鼠标 点击一处时根据这个点重新生成一个 裁剪框，move可以拖动图片，none:图片不能拖动
      autoCropArea={1}
      center
      highlight
      responsive //Re-render the cropper when resizing the window.
    />
  );
};
