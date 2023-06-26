import React from 'react';
import TextItem from './TextItem';
import { GroupContainer } from '../../../common/withGroup';

const titles = [
  { content: '添加标题内容', props: { fontSize: 34, color: '#333333', bold: true } },
  { content: '添加说明内容', props: { fontSize: 26, color: '#333333' } },
  { content: '添加正文内容', props: { fontSize: 30, color: '#333333' } },
];

export default function Text() {
  return (
    <GroupContainer
      groups={[
        {
          name: '普通文字',
          status: 'loaded',
          expandable: true,
          list: titles,
          total: titles.length,
        },
      ]}
    >
      {groupData => (
        <React.Fragment>
          {groupData.list.map((item, index) => (
            <TextItem key={index} title={groupData.name} content={item.content} props={item.props} />
          ))}
        </React.Fragment>
      )}
    </GroupContainer>
  );
}
