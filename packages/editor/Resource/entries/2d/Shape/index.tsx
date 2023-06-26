import React from 'react';
import ShapeItem from './ShapeItem';
import { ReactComponent as Circle } from './circle.svg';
import { ReactComponent as Rectangle } from './rectangle.svg';
import { ReactComponent as Triangle } from './triangle.svg';
import { GroupContainer } from '../../../common/withGroup';
import { css } from 'emotion';

const shapes = [
  { name: 'circle', comp: Circle },
  { name: 'rectangle', comp: Rectangle },
  { name: 'triangle', comp: Triangle },
];

export default function Shape() {
  return (
    <GroupContainer
      groups={[
        {
          name: '基础图形',
          status: 'loaded',
          expandable: true,
          list: shapes,
          total: shapes.length,
        },
      ]}
    >
      {groupData => (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
          })}
        >
          {groupData.list.map((item, index) => (
            <ShapeItem key={index} name={item.name} Comp={item.comp} />
          ))}
        </div>
      )}
    </GroupContainer>
  );
}
