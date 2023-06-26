import { decodeProjectId } from '@shared/api/project';

export async function getFromUrl() {
  const params = new URLSearchParams(location.search);
  const projectId = Number(location.pathname.split('/').pop()) || 0;
  if (location.pathname.endsWith('/component')) {
    return { type: 'component', url: params.get('url') || '' } as const;
  }
  if (params.get('from') !== 'rubeex') {
    const orderId = params.get('scene')?.split(',').pop();
    if (orderId) {
      resetState(orderId);
    }
    return { type: 'project', id: projectId, orderId } as const;
  }
  return {
    type: 'project',
    id: await decodeProjectId(projectId, params.has('type') ? Number(params.get('type')) : -1),
  } as const;
}

export function addState(orderId: string) {
  const url = new URL(window.location as any);
  const current = url.searchParams.get('scene');
  url.searchParams.set('scene', current ? `${current},${orderId}` : orderId);
  history.replaceState({}, '', url);
}

export function removeState(length: number) {
  const url = new URL(window.location as any);
  const current = url.searchParams.get('scene')?.split(',') ?? [];
  const newValue = current.slice(0, current.length - length).join(',');
  if (newValue) {
    url.searchParams.set('scene', newValue);
  } else {
    url.searchParams.delete('scene');
  }
  history.replaceState({}, '', url);
}

export function resetState(orderId?: string) {
  const url = new URL(window.location as any);
  if (orderId) {
    url.searchParams.set('scene', orderId);
  } else {
    url.searchParams.delete('scene');
  }
  history.replaceState({}, '', url);
}
