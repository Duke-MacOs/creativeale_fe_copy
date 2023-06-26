export const formatBytes = (bytes: number, unit = 'BKMG'): string => {
  if (bytes < 1024 || unit.length < 2) {
    return `${Math.round(bytes)}${unit.slice(0, 1)}`;
  }
  return formatBytes(bytes / 1024, unit.slice(1));
};
