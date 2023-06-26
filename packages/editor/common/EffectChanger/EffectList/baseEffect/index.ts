import baseIcon from './baseIcon.svg';
import baseEffect from './base.json';

const baseIcons = baseEffect.reduce((icons, { list }) => {
  list.forEach(({ name }) => (icons[name] = { default: baseIcon }));
  return icons;
}, {} as Record<string, any>);

export { baseEffect, baseIcons };
