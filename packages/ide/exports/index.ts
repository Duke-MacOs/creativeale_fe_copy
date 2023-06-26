import { collectEvent, EventTypes } from '@editor/utils';

export const openWebIde = (projectId: number, orderId: number) => {
  collectEvent(EventTypes.CodeMode, null);
  const query = new URLSearchParams(location.search);
  query.set('project', String(projectId));
  query.set('tab', String(orderId));
  window.open(`/ide?${query}`, `webIdeWindow${projectId}`);
};
