export default () => {
  const src = [
    'https://slardar',
    'bytedance',
    'net/node/web/kanban/detail/84641?env=Slardar_All&bid=PlayableCaseTest&start_time=1642735371&end_time=1642994571&dashboardLayout=0&layout=contentOnly&href=https%3A%2F%2Fslardar',
    'bytedance',
    'net%2Fnode%2Fweb%2Fkanban%2Fdetail%2F84641%3Fenv%3DSlardar_All%26bid%3DPlayableCaseTest%26start_time%3D1642735371%26end_time%3D1642994571',
  ].join('.');
  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <iframe width="100%" height="800px" frameBorder="0" scrolling="no" src={src} />
    </div>
  );
};
