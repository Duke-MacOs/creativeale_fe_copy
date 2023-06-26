import { Menu, MenuProps } from 'antd';
import { useState } from 'react';
import Case from './pages/case';
import Main from './pages/main';

const items: MenuProps['items'] = [
  {
    label: '账号总览',
    key: 'main',
  },
  {
    label: '项目',
    key: 'case',
  },
];

export default () => {
  const [currentPage, setCurrentPage] = useState('main');
  const onClick: MenuProps['onClick'] = e => {
    console.log('click ', e);
    setCurrentPage(e.key);
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', width: '100%' }}>
      <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={items} />
      <div>
        <Main visible={currentPage === 'main'} setCurrentPage={setCurrentPage} currentPage={currentPage} />
        <Case visible={currentPage === 'case'} currentPage={currentPage} />
      </div>
    </div>
  );
};
