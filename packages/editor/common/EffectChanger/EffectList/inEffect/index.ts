import inIcon from './inIcon.svg';
import inEffect from './in.json';

const inIcons = inEffect.reduce((icons, { list }) => {
  list.forEach(({ name }: any) => (icons[name] = { default: inIcon }));
  return icons;
}, {} as Record<string, any>);

export { inEffect, inIcons };
