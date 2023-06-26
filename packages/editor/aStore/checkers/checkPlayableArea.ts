import { BOTTOM_HEIGHT, TOP_HEIGHT } from './checkDirectDownloadScript';
import { ICaseState, INodeState, ISceneState } from '../project';
import { cleanProject, findById } from '@editor/utils';
import { toColorful } from '@shared/utils';

export function checkPlayableAreaAll(project: ICaseState) {
  if (project.settings.typeOfPlay !== 3) {
    return '';
  }
  const scenes = cleanProject(project)
    .scenes.map(scene => Array.from(checkPlayableAreaBase(scene)))
    .filter(array => array.length);
  if (!scenes.length) {
    return '';
  }
  return `${scenes.length}个场景内共存在${scenes.flat().length}个互动元素会出现在限制区`;
}

export function* checkPlayableArea(scene: ISceneState) {
  for (const { type, sceneName, nodeName } of checkPlayableAreaBase(scene)) {
    yield {
      type,
      message: toColorful(
        '场景',
        { text: sceneName },
        '的',
        { text: nodeName },
        '元素在限制互动区域，可能会影响互动效果，请及时预览检查'
      ),
      warning: toColorful({ text: nodeName }, '元素在限制互动区域，可能会影响互动效果，请及时预览检查'),
    };
  }
}

export function* checkPlayableAreaBase({ type, props, nodes, name: sceneName }: ISceneState) {
  if (type !== 'Scene') {
    return;
  }
  const map = {} as Record<number, boolean>;
  for (const [key, prop] of Object.entries(props)) {
    if (
      prop.type === 'Animation' ||
      (prop.type === 'Script' &&
        (prop.enabled ?? true) &&
        ['Click', 'LongPress', 'MouseDown', 'MouseUp', 'Gesture', 'Drag'].includes(prop.script!))
    ) {
      const paths = findById(nodes, Number(key), prop.type !== 'Animation');
      const handle = (paths: INodeState[]) => {
        if (!paths.length) {
          return [];
        }
        let { width = 0, height = 0 } = props[paths[0].id];
        const { name = '' } = props[paths[0].id];
        let [x, y] = paths.reduce(
          (point, { id }) => {
            point[0] += props[id].x ?? 0;
            point[1] += props[id].y ?? 0;
            return point;
          },
          [0, 0]
        );
        if (prop.script === 'Gesture') {
          const { gestureType = 1, distance = 100 } = prop;
          switch (gestureType) {
            case 0:
              x -= distance;
              width += distance;
              break;
            case 1:
              width += distance;
              break;
            case 2:
              y -= distance;
              height += distance;
              break;
            case 3:
              height += distance;
              break;
          }
        }
        if (!map[paths[0].id] && (x < 0 || y < TOP_HEIGHT || x + width > 750 || y + height > BOTTOM_HEIGHT)) {
          map[paths[0].id] = true;
          return [
            {
              type: `NotInPlayableArea:${paths[0].id}`,
              sceneName,
              nodeName: name,
            },
          ];
        }
        return [];
      };
      yield* handle(paths);
      if (prop.script === 'Drag' && prop.targetId! > 0) {
        yield* handle(findById(nodes, prop.targetId!));
      }
    }
  }
}
