import React, { useEffect, useState } from 'react';
import '@dp/aeolus-sdk';
import { fetchDashboardToken } from '@shared/api';

export default () => {
  const [token, setToken] = useState<string>('');
  const host = ['https', ':', '//', 'data', '.', 'bytedance', '.', 'net', '/', 'aeolus'];
  useEffect(() => {
    fetchDashboardToken().then(res => {
      setToken(res);
    });
  }, []);
  return (
    <div style={{ height: '800px' }}>
      {token !== '' && <aeolus-dashboard dashboardId="251266" appId="1821" host={host.join('')} token={token} />}
    </div>
  );
};
