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
    title: '跳转组件',
    entries: [
      {
        id: 'PVGuider',
        category: 'PVGuider',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/f4d08e5f8f2f13de20d04fe4bd03f037.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/f4d08e5f8f2f13de20d04fe4bd03f037.png',
        name: '引导手势',
        description: '引导手势',
        props: {
          name: '引导手势',
        },
      },
      {
        id: 'PVButton',
        category: 'PVButton',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/ea45652bee36e9d4d34a03c879d55f86.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/1ac7643d1f6d110b27ffbcfe122a27bc.png',
        name: '图文按钮',
        description: '图文按钮',
        props: {
          activeUrl:
            'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/1ac7643d1f6d110b27ffbcfe122a27bc.png',
          jumpSceneId: 0,
          buttonType: 'normal',
          showGuide: false,
          text: '图文按钮',
          guideTitle: '点击',
        },
      },
      {
        id: 'PVClickArea',
        category: 'PVClickArea',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/6224a5d9661264dc72e24d91b45b6349.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/6224a5d9661264dc72e24d91b45b6349.png',
        name: '点击热区',
        description: '热区',
        props: {
          showGuide: false,
          jumpSceneId: 0,
          guideTitle: '点击',
        },
      },
      {
        id: 'PVSlider',
        category: 'PVSlider',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/a17f99015eae9222eaef3a4e36f388f3.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/b39ddc37a7111eefb85c6c8e8380bcec.png',
        name: '滑条组件',
        description: '滑条',
        props: {
          jumpSceneId: 0,
          name: '滑条滑块',
          guideTitle: '滑动',
        },
      },
      {
        id: 'PVDragger',
        category: 'PVDragger',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/01bb66972e8be5cf4445d44e478bfd8c.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/6dfdaf56f636e48f615723ce20daf9d8.png',
        name: '拖拽组件',
        description: '拖拽',
        props: {
          jumpSceneId: 0,
          name: '拖拽组件',
          guideTitle: '拖拽',
        },
      },
    ],
  },
  {
    title: '装饰组件',
    entries: [
      {
        id: 'PVSprite',
        category: 'PVSprite',
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/0866050d5fc094bf01ee60f32f3321d0.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/0866050d5fc094bf01ee60f32f3321d0.png',
        name: '图片',
        description: '装饰图片',
      },
      {
        id: 'PVFrameAnime',
        category: 'PVFrameAnime' as any,
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/0866050d5fc094bf01ee60f32f3321d0.png',
        url: 'material/preview/2ce4506f3725ba354e09cb0b67715493/sequence.json?mid=7019122308006592556',
        name: '动画',
        description: '动画',
      },
      {
        id: 'PVText',
        category: 'PVText' as any,
        cover:
          'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/9b9e6c80c3e32aaba88fb958fe72bc3d.png',
        url: '说明文案',
        name: '文本',
        description: '说明文案',
      },
      {
        id: 'PVAlphaVideo',
        category: 'PVAlphaVideo' as any,
        cover: 'https://p7.itc.cn/images01/20210208/735c861e79684b1d9e9e743eabf1cfd5.png',
        url: 'https://creativelab-proxy.bytedance.com/api/upload/bucket/material/private/preview/1f37e35899cfe85acecfb28cb26e1f45/00b9f975104efcede5106a8facfd7afc.mp4',
        name: '出框视频',
        description: '出框视频',
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
          type="default"
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
