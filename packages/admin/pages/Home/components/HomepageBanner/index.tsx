import React, { useState } from 'react';
import AnimateWrapper from '../AnimateWrapper';
import MultipleVideo from '../MultipleVideo';
import RightArrowText from '../RightArrowText';
import { Button } from 'antd';
import './style.less';

export default function HomepageBanner() {
  const BANNER_SCENE = [
    {
      detail: (
        <AnimateWrapper
          key="banner-scene-animation-0"
          animationName="animate__fadeIn"
          content={
            <>
              <div className="homepage-banner-title">一站式互动素材创编平台</div>
              <div className="homepage-banner-description">零代码可视化，让互动素材制作更简单 </div>

              <div>
                <Button
                  className="homepage-banner-button"
                  style={{ minWidth: '0' }}
                  onClick={() => {
                    location.href = `${location.origin}/my/project`;
                  }}
                >
                  <RightArrowText
                    content={<div>立即制作</div>}
                    arrowSize={16}
                    arrowColor="#ffffff"
                    arrowStyle={{ marginTop: '3px' }}
                  />
                </Button>
                <Button
                  className="homepage-banner-button"
                  style={{ minWidth: '0' }}
                  onClick={() => {
                    location.href = `${location.origin}/help`;
                  }}
                >
                  <RightArrowText
                    content={<div>查看帮助</div>}
                    arrowSize={16}
                    arrowColor="#ffffff"
                    arrowStyle={{ marginTop: '3px' }}
                  />
                </Button>
              </div>
            </>
          }
        />
      ),
      background: (
        <MultipleVideo
          key="banner-scene-background-0"
          firstShowVideoUrl={`https://v3-default.ixigua.com/2da5a635f8396cccd0379651541a6690/741d6591/video/tos/cn/tos-cn-v-736065/d9daf67939234f79ae4669b819b57c3c/?a=0&br=9696&bt=9696&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=&er=0&ft=uSx5SggtInz7T_NS-Yi&l=202109271420000102090920742B33F917&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M2h3Z2g6ZmZwODQzNDg1M0ApZjczdHg6dTY7ZjMzajw1eWdgMS1ucjRvMDVgLS1kNi9zcy1icWFiNGBgajIuLS4yLy06Yw%3D%3D&vl=&vr=`}
          loopVideoUrl={`https://v3-default.ixigua.com/1c23c29e63fc32e575f4bf6201d20285/741d659f/video/tos/cn/tos-cn-v-736065/f7b8571a8d1d43208fd5efb4acdb6ab6/?a=0&br=13506&bt=13506&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=&er=0&ft=uSx5SggtInz7TzNS-Yi&l=202109271420130102090920742B33FBAF&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=am53cDQ6ZmZwODQzNDg1M0ApdWtoaXg6dTY7ZjMzajw1eWdvZWJjcjRvMDVgLS1kNi9zc2RocWouNGBgajIuLS4yLy06Yw%3D%3D&vl=&vr=`}
        />
      ),
    },
  ];

  const [currentSceneIndex] = useState(0);

  return (
    <div className="homepage-banner-wrapper">
      <div className="homepage-banner flex-row-center">
        <div className="homepage-banner-button-previous" />
        <div className="homepage-banner-content">{BANNER_SCENE[currentSceneIndex].detail}</div>
        <div className="homepage-banner-button-next" />
      </div>
      <div className="homepage-banner-background">{BANNER_SCENE[currentSceneIndex].background}</div>
    </div>
  );
}
