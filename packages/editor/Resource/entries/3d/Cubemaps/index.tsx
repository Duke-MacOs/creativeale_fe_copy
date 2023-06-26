import Cubemaps from './Cubemaps';
import withTabs from '../../../common/withTabs';
import withGroup from '../../../common/withGroup';
const GroupCubemaps = withGroup(Cubemaps);

export default withTabs('Cubemaps', props => {
  if (props.provider === 'public') return <GroupCubemaps {...props} />;

  return (
    <div style={{ padding: '16px 12px 0' }}>
      <Cubemaps {...props} groupData={props.groups[0]} />
    </div>
  );
});
