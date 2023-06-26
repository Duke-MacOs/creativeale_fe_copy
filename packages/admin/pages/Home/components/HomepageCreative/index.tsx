import React from 'react';
import { useInViewOnce } from '../../common/hooks/useInViewOnce';
import { homepageService } from '../../service/homepageService';
import './style.less';

export default function HomepageCreative() {
  const creativeList = homepageService.getHomepageCreative();
  const [ref, realInView] = useInViewOnce();

  return (
    <div className="homepage-creative-wrapper">
      <div className={`homepage-creative ${realInView ? 'animate__animated animate__fadeInUp' : ''}`} ref={ref}>
        <div className="homepage-creative-title">全链路互动创意服务</div>
        <div className="homepage-creative-description">
          打造互动创意生产生态、统一高效管理、动态优选投放和高性能展现优化全球领先的全链路互动创意平台
        </div>
        <div className="flex-row-space-around">
          {creativeList.map((item, index) => (
            <div className="homepage-creative-item transition-300-ms" key={`homepage-creative-item-${index}`}>
              <div className="homepage-creative-item-image">
                <img src={item.keyFrameUrl} width={200} height={170} />
              </div>
              <div className="homepage-creative-item-title">{item.title}</div>
              <div className="homepage-creative-item-description">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
