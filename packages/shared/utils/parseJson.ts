export const parseJson = (content: any, defaultValue?: any) => {
  try {
    return JSON.parse(content);
  } catch {
    return defaultValue ?? content;
  }
};
