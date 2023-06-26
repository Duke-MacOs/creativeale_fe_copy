import { useState } from 'react';
import { GroupContainer } from './GroupContainer';
import { GridContainer } from './GridContainer';
import { Left, Right } from '@icon-park/react';
import { ResourceEntry } from './types';
import { Button, theme } from 'antd';
import Icon from '@ant-design/icons';
import Preview from './Preview';
import { css } from 'emotion';

const componentList: Array<{ title: string; entries: ResourceEntry[] }> = [
  {
    title: '交互组件',
    entries: [
      {
        id: 'VRButton',
        category: 'VRButton',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/ea45652bee36e9d4d34a03c879d55f86.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/1ac7643d1f6d110b27ffbcfe122a27bc.png',
        name: '图文按钮',
        description: '图文按钮',
        props: {
          activeUrl:
            'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/1ac7643d1f6d110b27ffbcfe122a27bc.png',
          buttonType: 'normal',
          showGuide: false,
          text: '图文按钮',
        },
      },
    ],
  },
  {
    title: '装饰组件',
    entries: [
      {
        id: 'VRSprite',
        category: 'VRSprite',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/0866050d5fc094bf01ee60f32f3321d0.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/0866050d5fc094bf01ee60f32f3321d0.png',
        name: '图片',
        description: '装饰图片',
      },
      {
        id: 'VRSound',
        category: 'VRSound',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/2046091147074299ddb30517fd825109.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/6d1a3846a5013e128ddb9b0eb49afb29.mp3',
        name: '声音',
        description: '背景声音',
      },
      {
        id: 'VRText',
        category: 'VRText' as any,
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/9b9e6c80c3e32aaba88fb958fe72bc3d.png',
        url: '说明文案',
        name: '文本',
        description: '说明文案',
      },
    ],
  },
];

export default function Resource() {
  const [visible, setVisible] = useState<boolean>(true);
  const { token } = theme.useToken();

  return (
    <div
      className={css({
        flex: '0 0 auto',
        position: 'relative',
        zIndex: 1,
        background: token.colorBgContainer,
      })}
    >
      <div
        className={css({
          background: token.colorBgContainer,

          boxShadow: '4px 2px 6px -3px rgba(0,0,0,0.08)',
          transform: 'translateX(100%)',
          position: 'absolute',
          height: '100%',
          right: 0,
          top: 0,
        })}
      >
        {visible && (
          <div
            className={css({
              overflow: 'auto',
              maxHeight: '100%',
            })}
          >
            {componentList.map(({ title, entries }, index) => (
              <GroupContainer key={index} title={title}>
                <GridContainer entries={entries} />
              </GroupContainer>
            ))}
          </div>
        )}
        <Button
          size="small"
          icon={<Icon component={(visible ? Left : Right) as any} />}
          style={{
            borderRadius: '0 4px 4px 0',
            transform: 'translate(100%)',
            position: 'absolute',
            transition: '0s',
            border: 'none',
            right: 0,
            top: 0,
          }}
          onClick={() => setVisible(!visible)}
        />
        <Preview />
      </div>
    </div>
  );
}
