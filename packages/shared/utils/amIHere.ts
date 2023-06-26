import { hasFeature } from '@shared/userInfo';

export const amIHere = ({
  release,
  online,
}: {
  /**
   * 定义一个功能是否对外开放
   */
  release?: boolean;
  /**
   * 定义一个功能能否在外使用
   */
  online?: boolean;
}) => {
  let result = true;
  if (release !== undefined) {
    result &&= release !== hasFeature();
  }
  if (online !== undefined) {
    const type = REACT_APP_BUILD_TYPE || 'online';
    result &&= online === (type !== 'offline');
  }
  return result;
};
