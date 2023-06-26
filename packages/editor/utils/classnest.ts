type Seed = number | string | boolean | null | undefined | Seed[] | { [key: string]: Seed };

const flatten = (seed: Seed): string[] => {
  const array = (seed: { [key: string]: Seed }) => {
    const array: string[] = [];
    for (const [key, val] of Object.entries(seed)) {
      if (val || val === 0) {
        array.push(key);
        flatten(val).forEach(sub => {
          array.push(`${key}-${sub}`);
        });
      }
    }
    return array;
  };
  if ((seed && seed !== true) || seed === 0) {
    if (Array.isArray(seed)) {
      return seed.map(flatten).reduce((a, b) => a.concat(b), []);
    }
    switch (typeof seed) {
      case 'string':
      case 'number':
        return [String(seed)];
      case 'object':
        return array(seed);
      default:
        return [];
    }
  }
  return [];
};

export const classnest = (seed: Seed): string => flatten(seed).join(' ');
