import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import QRCode from 'qrcode';
import { Previewer } from '@editor/Editor/Header';

export default ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [qrCode, setQrCode] = useState('');
  useEffect(() => {
    if (url.includes('feed-preview')) {
      QRCode.toDataURL(url, { width: 132 * 2 }).then(dataUrl => {
        setQrCode(dataUrl);
      });
    }
  }, [url]);

  return (
    <Modal visible={true} centered onCancel={onClose} footer={null} width="300px">
      {qrCode === '' ? (
        <Previewer httpUrl={url} originSize={[667, 375]} onClose={onClose} />
      ) : (
        <>
          <div>请用「抖音」App扫码预览</div>
          <div style={{ color: '#999', fontSize: 12, paddingTop: 3 }}>「抖音」请用21.6.0以上版本扫码</div>
          <img src={qrCode} alt="预览二维码" />
        </>
      )}
    </Modal>
  );
};
