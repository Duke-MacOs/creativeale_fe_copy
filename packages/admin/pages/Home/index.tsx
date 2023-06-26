import './style.less';
import HomePageJoinUs from './components/HomepageShowcase/HomepageJoinUs';
import HomepageShowcase from './components/HomepageShowcase';
import HomepageCreative from './components/HomepageCreative';
import HomepageBanner from './components/HomepageBanner';

import Footer from './components/Footer';
import { css } from 'emotion';

export default function Home() {
  return (
    <div
      className={css({
        '& *': {
          boxSizing: 'unset', // 兼容主页样式
        },
        '& a': {
          color: 'inherit',
        },
      })}
    >
      <HomepageBanner />
      <HomepageShowcase />
      <HomepageCreative />
      <HomePageJoinUs />
      <Footer />
    </div>
  );
}
