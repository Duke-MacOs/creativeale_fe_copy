import Model from './Model';
import withTabs from '../../../common/withTabs';
import withGroup from '../../../common/withGroup';
const GroupModel = withGroup(Model);
export default withTabs('Model', props => {
  if (props.provider === 'public') return <GroupModel {...props} />;

  return <Model {...props} groupData={props.groups[0]} />;
});
