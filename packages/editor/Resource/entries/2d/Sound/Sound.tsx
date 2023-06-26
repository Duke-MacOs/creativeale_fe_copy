import React from 'react';
import { WithGroupComponentProps } from '../../../common/withGroup';
import useDelResourceEntry from '../../../common/useDelResourceEntry';
import useReplacing from '../../../common/useReplacing';
import { useUserInfo } from '@editor/aStore';
import { IMaterial } from '@/types/library';
import { SoundItem } from './SoundItem';

export default function Sound({ groupData, setGroupData, provider, category }: WithGroupComponentProps<IMaterial>) {
  const { replacing } = useReplacing();
  const onDelResourceEntry = useDelResourceEntry();
  const userinfo = useUserInfo();
  return (
    <div>
      {groupData.list.map(entry => (
        <SoundItem
          key={entry.id}
          materialId={entry.id}
          musicData={entry}
          groupData={groupData}
          setGroupData={setGroupData}
          provider={provider}
          category={category}
          onDelete={
            !replacing && (provider === 'project' || (provider === 'shared' && userinfo?.userId === entry.userId))
              ? () => {
                  return onDelResourceEntry(category, provider, entry.id);
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}
