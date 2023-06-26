import { throwColorful } from '@shared/utils';
import { isLoopVideoType, VideoType, videoType } from '@editor/type4';

export function checkPlayableVideoState({ scenes, settings: { typeOfPlay } }: EditorState['project']) {
  if (typeOfPlay !== 4) {
    return;
  }
  const unused = scenes.find(({ orderId }) => videoType(orderId, scenes) === VideoType.Unused);
  if (unused) {
    throwColorful({ text: unused.name }, '视频场景未被使用');
  }
  const starts = scenes.filter(({ orderId }) => videoType(orderId, scenes) === VideoType.Start);
  if (!starts.length) {
    throwColorful('没有开始视频场景');
  } else if (starts.length > 1) {
    throwColorful('有且只有一个开始视频场景');
  }
  if (isLoopVideoType(starts[0].props)) {
    throwColorful('开始视频不能为循环视频');
  }
  for (const { props, name: sceneName } of scenes) {
    for (const { type, name, jumpSceneId } of Object.values(props)) {
      if (
        type !== 'PVVideo' &&
        typeof jumpSceneId === 'number' &&
        scenes.every(({ orderId }) => orderId !== jumpSceneId)
      ) {
        throwColorful({ text: sceneName }, '的', { text: name! }, '未正确设置跳转视频');
      }
    }
  }
}
