import React from 'react';
export default () => {
  const url = [
    'https://',
    'data.',
    'bytedance.',
    'net/',
    'tea/',
    'app/',
    '327429/',
    'dashboard/',
    '7002883805690200583',
  ];
  const src = `${url.join('')}?hideAppHeader&hideDashLeft&hideDashTitle&hideDashFilter`;
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <iframe width="100%" height="800px" frameBorder="0" scrolling="no" src={src} />
    </div>
  );
};
