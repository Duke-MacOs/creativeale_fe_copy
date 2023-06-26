export * from './applyScene';
export * from './applyState';

export const isReadOnly = (flag: 0 | 1 = 1) => location.search.includes(`readonly=${flag}`);
