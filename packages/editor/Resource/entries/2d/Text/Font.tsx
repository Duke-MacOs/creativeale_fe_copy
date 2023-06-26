import React from 'react';
import { Empty } from 'antd';
import { useUserInfo } from '@editor/aStore';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { IMaterial } from '@/types/library';
import FontItem from './FontItem';

export default ({ groupData: group, provider }: WithGroupComponentProps<IMaterial>) => {
  const userinfo = useUserInfo();
  if (!group.list.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <>
            点击本地上传
            <br />
            丰富你的字体吧～
          </>
        }
      />
    );
  }
  return (
    <>
      {group.list.map((item, index) => (
        <FontItem key={index} item={item} provider={provider} staffId={userinfo?.userId} />
      ))}
    </>
  );
};
