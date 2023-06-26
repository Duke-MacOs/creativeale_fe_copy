import Texture2D from './Texture2D';
import withTabs from '../../../common/withTabs';

export default withTabs('Texture2D', props => {
  return (
    <div style={{ padding: '16px 12px 0' }}>
      <Texture2D {...props} />
    </div>
  );
});
