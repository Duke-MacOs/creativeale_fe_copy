import effects from './out.json';
import outIcon from './outIcon.svg';

const outEffect = effects.map(group => {
  return {
    ...group,
    list: [...group.list].map(effect => ({ ...effect, props: { isInEffect: false, ...effect.props } })),
  };
});

const outIcons = outEffect.reduce((icons, { list }) => {
  list.forEach(({ name }: any) => (icons[name] = { default: outIcon }));
  return icons;
}, {} as Record<string, any>);

export { outEffect, outIcons };
