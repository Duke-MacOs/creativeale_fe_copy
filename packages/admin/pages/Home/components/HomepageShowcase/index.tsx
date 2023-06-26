import React, { useState } from 'react';
import { useInViewOnce } from '../../common/hooks/useInViewOnce';
import { useToggle } from '../../common/hooks/useToggle';
import ShowcaseLeftArrow from '../../common/svgs/ShowcaseLeftArrow';
import ShowcaseRightArrow from '../../common/svgs/ShowcaseRightArrow';
import VideoBox from '../VideoBox';
import { homepageService } from '../../service/homepageService';
import './style.less';

export default function HomepageShowcase() {
  const creativeList = homepageService.getHomepageShowCase();
  const [ref, realInView] = useInViewOnce();
  const [swiperStatus, showSwiper, hideSwiper] = useToggle(false);
  const [swiperLeft, swiperLeftActive, swiperLeftDefault] = useToggle(false);
  const [swiperRight, swiperRightActive, swiperRightDefault] = useToggle(false);
  const [currentCreative, setCurrentCreative] = useState(creativeList[0]);
  const [currentShowcaseIndex, setCurrentShowcaseIndex] = useState(0);

  const onClickPrevious = () => {
    if (currentShowcaseIndex === 0) {
      setCurrentShowcaseIndex(currentCreative.showcase.length - 1);
    } else {
      setCurrentShowcaseIndex(currentShowcaseIndex - 1);
    }
  };

  const onClickNext = () => {
    if (currentShowcaseIndex === currentCreative.showcase.length - 1) {
      setCurrentShowcaseIndex(0);
    } else {
      setCurrentShowcaseIndex(currentShowcaseIndex + 1);
    }
  };

  return (
    <div className="flex-column-center homepage-showcase-wrapper">
      <div
        className={`homepage-showcase flex-column ${realInView ? 'animate__animated animate__fadeInUp' : ''}`}
        ref={ref}
      >
        <div className="flex-column-center">
          <div className="flex-row-center homepage-showcase-select">
            {creativeList.map((item, index) => (
              <div
                className="homepage-showcase-select-item flex-column-center"
                key={`homepage-showcase-select-${index}`}
                onClick={() => {
                  setCurrentCreative(item);
                  setCurrentShowcaseIndex(0);
                }}
              >
                <div
                  className={
                    item.title === currentCreative.title
                      ? 'homepage-showcase-select-item-type-select'
                      : 'homepage-showcase-select-item-type-default'
                  }
                >
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="homepage-showcase-detail flex-row-center" onMouseEnter={showSwiper} onMouseLeave={hideSwiper}>
          <div
            className="homepage-showcase-swiper-button-previous"
            style={{
              visibility: swiperStatus && currentCreative.showcase.length > 1 ? 'visible' : 'hidden',
            }}
            onClick={onClickPrevious}
            onMouseEnter={swiperLeftActive}
            onMouseLeave={swiperLeftDefault}
          >
            <ShowcaseLeftArrow active={swiperLeft} />
          </div>
          <div
            style={{ width: '100%' }}
            className="flex-row-left animate__animated animate__fadeIn"
            key={`homepage-showcase-${currentShowcaseIndex}`}
          >
            <div className="homepage-showcase-video-wrapper">
              <div className="homepage-showcase-video">
                <VideoBox src={currentCreative.showcase[currentShowcaseIndex].caseUrl} autoPlay={true} />
              </div>
            </div>
            <div className="flex-column-center">
              <div className="homepage-showcase-detail-title">
                {currentCreative.showcase[currentShowcaseIndex].title}
              </div>
              <div className="homepage-showcase-detail-description">
                {currentCreative.showcase[currentShowcaseIndex].description}
              </div>
              <div className="flex-row-left">
                {currentCreative.showcase[currentShowcaseIndex].tags.map((item, index) => (
                  <div className="homepage-showcase-detail-tag-item" key={`homepage-showcase-tag-${index}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-row-left">
                {currentCreative.showcase[currentShowcaseIndex].data.map((item, index) => (
                  <div className="homepage-showcase-detail-data-item" key={`homepage-showcase-data-${index}`}>
                    <div className="flex-row-left homepage-showcase-detail-statistics">
                      <div className="homepage-showcase-detail-data-number">{item.number}</div>
                      <div className="homepage-showcase-detail-data-unit">{item.unit}</div>
                    </div>
                    <div className="homepage-showcase-detail-data-name">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className="homepage-showcase-swiper-button-next"
            style={{
              visibility: swiperStatus && currentCreative.showcase.length > 1 ? 'visible' : 'hidden',
            }}
            onClick={onClickNext}
            onMouseEnter={swiperRightActive}
            onMouseLeave={swiperRightDefault}
          >
            <ShowcaseRightArrow active={swiperRight} />
          </div>
        </div>
      </div>
    </div>
  );
}
