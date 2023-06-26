import withGroup from '../../../common/withGroup';
import withTabs from '../../../common/withTabs';
import Video from './Video';

const GroupVideo = withGroup(Video);

export default withTabs('Video', GroupVideo);

export const NativeLoadingVideo = withTabs('NativeLoadingVideo', GroupVideo);
export const PVAlphaVideo = withTabs('PVAlphaVideo', GroupVideo);
export const NativeVideo = withTabs('NativeVideo', GroupVideo);
export const VRVideo = withTabs('VRVideo', GroupVideo);
