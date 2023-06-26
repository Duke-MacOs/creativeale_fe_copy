import { Card, Typography } from 'antd';
import { ExportHistory, getHistory } from './storage';
import dayjs from 'dayjs';
import { useZipQRCode } from '../../Preview/useQRCode';
import { copyText } from '@shared/utils';
import { useState } from 'react';
import { downloadUri } from '@editor/utils';

export const HistoryOverlay = ({ histories }: { histories: ReturnType<typeof getHistory> }) => {
  const [hoverIndex, setHoverIndex] = useState(-1);
  return (
    <Card title="导出历史" size="small">
      {histories.length === 1 ? (
        <Item {...histories[0]} />
      ) : (
        <div style={{ display: 'grid', gridTemplate: 'auto / repeat(2,1fr)', gap: '8px 16px' }}>
          {histories.map((item, index) => {
            return (
              <div
                key={index}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex(-1)}
                style={{ opacity: hoverIndex > -1 && index !== hoverIndex ? 0.25 : 1, transition: '.3s' }}
              >
                <Item {...item} />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

const Item = ({ content, createTime, QRCodeUrl, zipUrl }: ExportHistory) => {
  const qrCode = useZipQRCode(QRCodeUrl, { width: 132 });
  return (
    <div style={{ display: 'grid', textAlign: 'center' }}>
      <img src={qrCode} alt="预览二维码" />
      {zipUrl && (
        <Typography.Link
          onClick={() => {
            downloadUri(zipUrl);
          }}
        >
          下载Zip包
        </Typography.Link>
      )}
      {content && <Typography.Link onClick={() => copyText(content, { tip: true })}>复制导出URL</Typography.Link>}
      {dayjs(createTime).format('MM-DD HH:mm:ss')}
    </div>
  );
};
