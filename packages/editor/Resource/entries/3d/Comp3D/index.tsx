import Comp3D from './Comp3D';
import withTabs from '../../../common/withTabs';
import withGroup from '../../../common/withGroup';
const GroupComp3D = withGroup(Comp3D);
export default withTabs('Animation3D', props => {
  if (props.provider === 'public') return <GroupComp3D {...props} />;

  return (
    <div style={{ padding: '16px 12px 0' }}>
      <Comp3D {...props} groupData={props.groups[0]} />
    </div>
  );
});
