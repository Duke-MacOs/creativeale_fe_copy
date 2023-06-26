export const HEADER_HEIGHT = 64;

export const PROD_HOST = ['creative-engine', 'bytedance', 'net'].join('.');
export const BOE_HOST = ['interactive-tech', 'bytedance', 'net'].join('.');

export const getEnv = () => {
  if (window.location.host === PROD_HOST) {
    return 'prod';
  }

  if (window.location.host === BOE_HOST) {
    return 'boe';
  }

  return 'dev';
};

export const BUSINESS_IMAGE_MAP = {
  toutiao: 'https://lf3-cdn-tos.bytescm.com/obj/union-fe/creative-engine/toutiao.png',
  douyin: 'https://lf3-cdn-tos.bytescm.com/obj/union-fe/creative-engine/douyin.png',
  tiktok: 'https://lf3-cdn-tos.bytescm.com/obj/union-fe/creative-engine/tiktok.png',
  xigua: 'https://lf3-cdn-tos.bytescm.com/obj/union-fe/creative-engine/xigua.png',
};
