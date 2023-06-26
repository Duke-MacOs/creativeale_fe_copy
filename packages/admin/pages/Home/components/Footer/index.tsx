import { Typography } from 'antd';
import './style.less';

export default function Footer() {
  return (
    <div className="footer" style={{ padding: 64, textAlign: 'center' }}>
      <Typography.Text type="secondary">©2022 巨量引擎 京ICP证140141号 京公网安备 11000002002023号</Typography.Text>
    </div>
  );
}
