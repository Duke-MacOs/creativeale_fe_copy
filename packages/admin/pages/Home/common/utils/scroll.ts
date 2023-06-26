import { HEADER_HEIGHT } from '../constants';

export const getDocumentScrollTop = () => {
  return document.documentElement.scrollTop || document.body.scrollTop;
};

export const isInViewPort = (element: HTMLElement | null) => {
  if (!element) {
    return false;
  }
  const { bottom } = element.getBoundingClientRect();
  return bottom >= HEADER_HEIGHT;
};
