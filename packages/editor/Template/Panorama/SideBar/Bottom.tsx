import { Button } from 'antd';
import { useState } from 'react';

export default ({ onAddSpace }: { onAddSpace: () => void }) => {
  const [addAreaLoading, setAddAreaLoading] = useState(false);
  return (
    <div style={{ display: 'grid' }}>
      <Button
        style={{ marginBottom: '5px' }}
        loading={addAreaLoading}
        onClick={async () => {
          setAddAreaLoading(true);
          await onAddSpace();
          setAddAreaLoading(false);
        }}
      >
        新增区域
      </Button>
    </div>
  );
};
