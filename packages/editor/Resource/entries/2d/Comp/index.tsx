import Comp from './Comp';
import withTabs from '../../../common/withTabs';

export default withTabs('Animation', props => {
  return (
    <div style={{ padding: '16px 12px 0' }}>
      <Comp {...props} groupData={props.groups[0]} />
    </div>
  );
});
