import { useUserInfo } from '@shared/userInfo';
import { Menu, MenuProps, message } from 'antd';
import { useEffect, useState } from 'react';
import create from 'zustand';
import Case from './pages/case';
import Main from './pages/main';
import Auth from './pages/auth';

const items: MenuProps['items'] = [
  {
    label: '账号总览',
    key: 'main',
  },
  {
    label: '项目',
    key: 'case',
  },
  {
    label: '已授权素材',
    key: 'auth',
  },
];

export const useCurrentParams = create(set => ({
  oldParams: {},
  setOldParams: (newParams: any) => set(() => ({ oldParams: newParams })),
}));
export default () => {
  const [currentPage, setCurrentPage] = useState('main');
  const onClick: MenuProps['onClick'] = e => {
    setCurrentPage(e.key);
  };
  const adv_id =
    Number(useUserInfo(({ userInfo: { teamId, teams } }) => teams.find(({ id }) => id === teamId)!.advId)) || 1;
  useEffect(() => {
    if (
      decodeURIComponent(location.search).includes('redirectResponse=') &&
      JSON.parse(decodeURIComponent(location.search).split('redirectResponse=')[1] || '').message ===
        '接受看数邀请失败：该授权链接未找到或已过期'
    ) {
      message.warning('接受看数邀请失败：该授权链接未找到或已过期');
    }
  }, []);
  return (
    <div style={{ backgroundColor: '#f9fafb', width: '100%' }}>
      <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={items} />
      <div>
        <Main
          visible={currentPage === 'main'}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          adv_id={adv_id}
        />
        <Case visible={currentPage === 'case'} currentPage={currentPage} />
        <Auth visible={currentPage === 'auth'} currentPage={currentPage} />
      </div>
    </div>
  );
};
