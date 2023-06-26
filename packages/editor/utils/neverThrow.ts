export const neverThrow = (value: never) => {
  throw new Error(`Oops, not supposed to throw: ${value}`);
};
