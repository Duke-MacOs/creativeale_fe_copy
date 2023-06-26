export default () => {
  const src = [
    'https://slardar',
    'bytedance',
    'net/node/web/kanban/detail/75371?env=Slardar_All&bid=magicplay&start_time=1642331516&end_time=1642590716&dashboardLayout=0&layout=contentOnly&href=https%3A%2F%2Fslardar',
    'bytedance',
    'net%2Fnode%2Fweb%2Fkanban%2Fdetail%2F75371%3Fenv%3DSlardar_All%26bid%3Dmagicplay%26start_time%3D1642331516%26end_time%3D1642590716',
  ].join('.');
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <iframe width="100%" height="800px" frameBorder="0" scrolling="no" src={src} />
    </div>
  );
};
