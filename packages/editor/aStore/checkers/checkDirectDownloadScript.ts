import { findById } from '@editor/utils';
import { hasDownloadEvent } from './checkDownloadOpacity';

export const TOP_HEIGHT = 204;
export const BOTTOM_HEIGHT = 1334 - 262;

export function checkDirectDownloadScript({ scenes }: EditorState['project']) {
  const endedNodes = [] as Array<{ id: number; name: string }>;
  for (const scene of scenes.filter(({ type }) => type === 'Scene')) {
    for (const [key, prop] of Object.entries(scene.props)) {
      if (prop.type === 'Script' && (prop.enabled ?? true) && hasDownloadEvent(prop.scripts, 'DirectDownload')) {
        const [{ id }] = findById(scene.nodes, Number(key), true);
        endedNodes.push({ id, name: prop.name ?? '' });
      }
    }
  }
  return endedNodes;
}
