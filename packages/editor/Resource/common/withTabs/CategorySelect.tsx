import React from 'react';
import { Button } from 'antd';

export default ({ categories, current, setCategory }: any) => {
  if (categories.length < 2) return null;
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: '-4px',
        padding: '16px 12px 0',
      }}
    >
      {categories.map(({ category, title }: any) => (
        <Button
          key={category}
          size="small"
          type={category === current ? 'primary' : 'default'}
          onClick={() => {
            setCategory(category);
          }}
          style={{ flex: 'auto 1 1', margin: '4px 2px' }}
        >
          {title}
        </Button>
      ))}
    </div>
  );
};
