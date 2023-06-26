import maskOutIcon from './maskOutIcon.svg';
import maskInIcon from './maskInIcon.svg';
import maskEffect from './mask.json';

const maskOutIcons = maskEffect.reduce((icons, { list }) => {
  list.forEach(({ name }: any) => (icons[name] = { default: maskOutIcon }));
  return icons;
}, {} as Record<string, any>);
const maskInIcons = maskEffect.reduce((icons, { list }) => {
  list.forEach(({ name }: any) => (icons[name] = { default: maskInIcon }));
  return icons;
}, {} as Record<string, any>);

export { maskEffect, maskInIcons, maskOutIcons };
