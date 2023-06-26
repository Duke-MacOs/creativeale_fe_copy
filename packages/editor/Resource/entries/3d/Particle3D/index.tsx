import Particle3D from './Particle3D';
import withTabs from '../../../common/withTabs';
import withGroup from '../../../common/withGroup';
const GroupParticle3D = withGroup(Particle3D);
export default withTabs('Particle3D', props => {
  if (props.provider === 'public') return <GroupParticle3D {...props} />;

  return (
    <div style={{ padding: '16px 12px 0' }}>
      <Particle3D {...props} groupData={props.groups[0]} />
    </div>
  );
});
