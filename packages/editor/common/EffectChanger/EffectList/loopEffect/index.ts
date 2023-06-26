import loopIcon from './loopIcon.svg';
import effects from './loop.json';

const loopEffect = effects.map(group => {
  return {
    ...group,
    list: [...group.list].map(effect => ({ ...effect, props: { loop: true, ...effect.props } })),
  };
});

const loopIcons = loopEffect.reduce((icons, { list }) => {
  list.forEach(({ name }: any) => (icons[name] = { default: loopIcon }));
  return icons;
}, {} as Record<string, any>);

export { loopEffect, loopIcons };
