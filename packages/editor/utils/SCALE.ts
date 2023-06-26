/**
 * 时间轴上前后多余的刻度数
 */
export const OFF_HEAD = 2;
export const OFF_TAIL = 4;
/**
 * 时间轴每一刻度长多少像素
 */
export const LENGTH = 10;
export const px2ms = (px: number, scale: number, offHead = false): number => {
  if (offHead) {
    return px2ms(px - OFF_HEAD * LENGTH, scale);
  }
  return Math.floor((px * scale) / LENGTH);
};
export const ms2px = (ms: number, scale: number) => {
  return Math.floor((ms * LENGTH) / scale);
};
