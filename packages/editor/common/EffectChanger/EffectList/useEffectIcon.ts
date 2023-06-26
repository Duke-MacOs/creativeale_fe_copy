import { useMemo } from 'react';
import { maskInIcons, maskOutIcons } from './maskEffect';
import { baseIcons } from './baseEffect';
import { loopIcons } from './loopEffect';
import { outIcons } from './outEffect';
import { inIcons } from './inEffect';

export default ([effectType, effectInfo]: [string?, string?] = []) => {
  const effectName = effectInfo?.split('_')[1];
  return useMemo(() => {
    const get = (o: Record<string, any>, key?: string) => {
      return (key && o[key]) || Object.values(o)[0];
    };
    const effectTypes: Record<string, Record<string, string>> = {
      maskOutEffect: maskOutIcons,
      maskInEffect: maskInIcons,
      maskEffect: maskInIcons,
      baseEffect: baseIcons,
      loopEffect: loopIcons,
      outEffect: { ...outIcons, ...maskOutIcons },
      inEffect: { ...inIcons, ...maskInIcons },
    };
    return get(get(effectTypes, effectType), effectName);
  }, [effectType, effectName]);
};
