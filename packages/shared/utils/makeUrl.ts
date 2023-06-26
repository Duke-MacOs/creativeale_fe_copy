import { amIHere } from './amIHere';

export function getUrlHead() {
  return amIHere({ online: true })
    ? 'https://creativelab-proxy.bytedance.com/api/upload/bucket/'
    : ['https://creativelab-proxy', 'bytedance', 'net/api/upload/bucket/'].join('.');
}
export const replaceWithProxy = (oldUrl?: string) => {
  if (typeof oldUrl !== 'string' || oldUrl.includes(' ')) {
    return oldUrl;
  }
  if (oldUrl.includes('bucketExpire')) {
    return oldUrl;
  }
  for (const flag of ['/files/', '/material/']) {
    if (oldUrl.startsWith('http') && oldUrl.includes(flag)) {
      return `${getUrlHead()}${oldUrl.slice(oldUrl.indexOf(flag) + 1)}`;
    }
  }
  for (const flag of ['files/', 'material/']) {
    if (oldUrl.startsWith(flag)) {
      return `${getUrlHead()}${oldUrl}`;
    }
  }
  return oldUrl;
};

export const absoluteUrl = (mayBeRelativeUrl: string, basePath?: string) => {
  if (
    mayBeRelativeUrl.startsWith('/') ||
    mayBeRelativeUrl.startsWith('data:') ||
    /^https?:\/\//.test(mayBeRelativeUrl)
  ) {
    return mayBeRelativeUrl;
  }
  return `${basePath ?? getUrlHead()}${mayBeRelativeUrl}`;
};
export const relativeUrl = (mayBeAbsoluteUrl: string) => {
  const match = /\/material\/|\/files\//.exec(mayBeAbsoluteUrl);
  if (match) {
    return mayBeAbsoluteUrl.slice(match.index + 1);
  }
  return mayBeAbsoluteUrl;
};
