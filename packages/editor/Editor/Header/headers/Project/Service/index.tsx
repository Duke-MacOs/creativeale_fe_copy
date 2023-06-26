import HeaderButton from '../HeaderButton';
import Icon from '@ant-design/icons';
import { HeadsetOne as ServiceIcon } from '@icon-park/react';
import { Card, Dropdown } from 'antd';
import Meta from 'antd/lib/card/Meta';
import QR from './serviceQR.png';
import { collectEvent, EventTypes } from '@editor/utils/collectEvent';
import { ReactNode } from 'react';

export default ({ children }: { children?: ReactNode }) => {
  return (
    <Dropdown
      onOpenChange={(visible: boolean) => {
        if (visible) {
          collectEvent(EventTypes.LookOncallService, null);
        }
      }}
      placement="bottomLeft"
      overlay={
        <Card hoverable bodyStyle={{ padding: 16, width: 200 }}>
          <img alt="二维码" src={QR} style={{ width: '100%', objectFit: 'contain' }} />
          <Meta
            title="互动编辑器服务台"
            description={
              <div style={{ whiteSpace: 'normal', wordBreak: 'break-all', wordWrap: 'break-word' }}>
                <p style={{ marginBottom: '3px' }}>
                  1.飞书搜索<span style={{ fontWeight: 'bold', color: '#3452ff' }}>「PlayableMaker 服务台」</span>
                  进行反馈
                </p>
                <p>2.若无搜索结果，请扫上方二维码申请</p>
              </div>
            }
          />
        </Card>
      }
    >
      <div>{children || <HeaderButton icon={<Icon component={ServiceIcon as any} />}>服务台</HeaderButton>}</div>
    </Dropdown>
  );
};
