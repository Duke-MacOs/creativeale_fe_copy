import { useEffect, useState } from 'react';
import QRCode, { QRCodeToDataURLOptions } from 'qrcode';

const pangleUrl = (httpUrl: string) => {
  const url = new URL(httpUrl);
  url.searchParams.set('immersive_mode', '1');
  url.searchParams.set('is_test_tool', '0');
  url.searchParams.set('is_playable', '1');
  url.searchParams.set('refer', 'scan');
  return url.href;
};

export const useZipQRCode = (...[httpUrl, options]: Parameters<typeof useQRCode>) => {
  if (httpUrl) {
    for (const flag of ['hidden_event_console=1']) {
      httpUrl = httpUrl.replace(flag, '');
    }
    httpUrl = pangleUrl(httpUrl);
  }
  return useQRCode(httpUrl, options);
};

export const useQRCode = (httpUrl: string, options?: QRCodeToDataURLOptions) => {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    if (httpUrl) {
      QRCode.toDataURL(httpUrl, options).then(dataUrl => {
        setDataUrl(dataUrl);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [httpUrl]);
  return dataUrl;
};
