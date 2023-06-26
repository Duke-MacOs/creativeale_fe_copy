export const gotoEditor = (
  params: {
    mode: 'project' | 'template' | 'product';
    id: number | string;
    readOnly?: boolean;
    newTab?: boolean;
  },
  urlQuery?: Record<string, string>
) => {
  if (params.newTab) {
    window.open(getEditorUrl(params, urlQuery));
  } else {
    location.href = getEditorUrl(params, urlQuery);
  }
};

export const getEditorUrl = (
  params: {
    mode: 'project' | 'template' | 'product';
    id: number | string;
    readOnly?: boolean;
    newTab?: boolean;
  },
  urlQuery?: Record<string, string>
) => {
  const url = new URL(location.href);
  url.pathname = `/play/${params.mode}/${params.id}`;
  if (params.readOnly) {
    url.searchParams.set('readonly', '1');
  }
  if (urlQuery) {
    Object.entries(urlQuery).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.href;
};
