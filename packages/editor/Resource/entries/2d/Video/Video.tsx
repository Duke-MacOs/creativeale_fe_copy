import useDelResourceEntry from '../../../common/useDelResourceEntry';
import useReplacing from '../../../common/useReplacing';
import { WithGroupComponentProps } from '../../../common/withGroup';
import { useUserInfo } from '@editor/aStore';
import { IMaterial } from '@/types/library';
import { VideoItem } from './VideoItem';

export default function Video({ groupData, setGroupData, category, provider }: WithGroupComponentProps<IMaterial>) {
  const { replacing } = useReplacing();
  const onDelResourceEntry = useDelResourceEntry();
  const userinfo = useUserInfo();

  return (
    <div>
      {groupData.list.map(entry => (
        <VideoItem
          key={entry.id}
          materialId={entry.id}
          videoData={entry}
          extra={entry.extra}
          groupData={groupData}
          setGroupData={setGroupData}
          provider={provider}
          category={category}
          onDelete={
            (!replacing || category === 'NativeVideo' || category === 'NativeLoadingVideo') &&
            (provider === 'project' || (provider === 'shared' && userinfo?.userId === entry.userId))
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
