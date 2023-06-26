import React from 'react';
import withTabs from '../../../common/withTabs';
import Text from './Text';
import Font from './Font';
import withGroup, { WithGroupProps } from '@editor/Resource/common/withGroup';
import { IMaterial } from '@/types/library';

const GroupFont = withGroup(Font);

export default withTabs('Font', (props: WithGroupProps<IMaterial>) => {
  if (props.provider === 'public') {
    return (
      <>
        {!props.searching && <Text />}
        <GroupFont {...props} groups={props.groups.map(group => ({ ...group, name: '艺术字体' }))} />
      </>
    );
  }
  return (
    <>
      <Text />
      <GroupFont {...props} groups={props.groups.map(group => ({ ...group, expandable: false }))} />
    </>
  );
});
