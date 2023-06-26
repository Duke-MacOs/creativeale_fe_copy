export const downloadUri = (uri: string, name: string = document.title.replace(/\./g, '_')) => {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadBlob = (content: Blob, name: string) => {
  const el = document.createElement('a');
  el.download = name;
  el.href = URL.createObjectURL(content);
  document.body.appendChild(el);
  el.click();
  document.body.removeChild(el);
};
