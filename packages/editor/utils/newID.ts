export const makeNewID = (startFrom?: number) => {
  let start = startFrom ?? Date.now();
  return () => start++;
};
export const newID = makeNewID();
