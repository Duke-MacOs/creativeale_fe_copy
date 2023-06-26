import { Layout, Menu } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { css } from 'emotion';
import { useHistory, useLocation } from 'react-router-dom';
import { getDocSrc, items } from './constant';

const { Sider, Content } = Layout;

export default function Tutorials() {
  const history = useHistory();
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const { mount, replace } = useFeishu();

  useEffect(() => {
    fetch('https://magicplay.oceanengine.com/static-cloud/invoke/feishuAuth', {
      method: 'POST',
      body: JSON.stringify({
        url: String(window.location.href),
      }),
    })
      .then(res => res.json())
      .then(
        ({
          appId, // 应用 appId
          signature, // 签名
          timestamp, // 时间戳（毫秒）
          nonceStr, // 随机字符串
          url, // app URL
        }) => {
          (window as any).webComponent
            .config({
              appId,
              signature,
              timestamp,
              nonceStr,
              url,
              jsApiList: ['DocsComponent'], // 指定要使用的组件，如 ['DocsComponent']
              lang: 'zh-中文', // 指定组件的国际化语言：en-英文、zh-中文、ja-日文
            })
            .then(() => {
              mount(getDocSrc(location.pathname));
              setLoaded(true);
            });
        }
      );
  }, []);
  useEffect(() => {
    if (loaded) {
      replace(getDocSrc(location.pathname));
    }
  }, [location.pathname]);

  return (
    <Layout>
      <Sider theme="light">
        <Menu
          mode="inline"
          items={items}
          className={css({ height: '100%' })}
          onClick={({ key }) => {
            if (key.startsWith('sub')) return;
            history.push(`/help${key}`);
          }}
        />
      </Sider>
      <Content id="feishu__root" />
    </Layout>
  );
}

function useFeishu() {
  const component = useRef<any>(null);
  function mount(src: string) {
    component.current = (window as any).webComponent.render(
      'DocsComponent',
      {
        //组件参数
        src,
        minHeight: '500px',
        width: '100%',
      },
      document.querySelector('#feishu__root') // 将组件挂在到哪个元素上
    );
    component.current.config.setFeatureConfig({
      HEADER: {
        enable: false, //  隐藏头部
      },
    });
  }

  function replace(src: string) {
    component.current.replace(src);
  }
  return {
    mount,
    replace,
  };
}
