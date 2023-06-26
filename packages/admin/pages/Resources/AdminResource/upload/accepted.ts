import omit from 'lodash/omit';
import { AcceptedType } from '@editor/Resource/upload/accepted';

export {
  ResourceType,
  AcceptedType,
  AcceptedSize,
  categoryOf,
  acceptedType,
  acceptedSize,
} from '@editor/Resource/upload/accepted';

export const accepted = Object.values(omit(AcceptedType, ['FrameAnime']))
  .filter(Boolean)
  .join(',')
  .split(',')
  .filter((accept, _, accepts) => accepts.filter(item => item === accept).length === 1)
  .join(',');
