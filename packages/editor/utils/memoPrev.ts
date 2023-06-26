export const memoPrev = <T extends any[], R>(func: (...args: T) => R): ((...args: T) => R) => {
  let prev: T = [] as any;
  let rest: R;
  return (...args: T): R => {
    if (prev.length !== args.length || args.some((arg, i) => arg !== prev[i])) {
      rest = func(...args);
      prev = args;
    }
    return rest;
  };
};
