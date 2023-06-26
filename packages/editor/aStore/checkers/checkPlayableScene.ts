import { ISceneState } from '@editor/aStore';
import { toColorful } from '@shared/utils';

export function* checkPlayableScene({ props, nodes, name: sceneName, editor }: ISceneState) {
  if (!editor.loading || !editor.playable) {
    return;
  }
  if (!nodes.filter(({ type }) => type === 'Video').length) {
    yield toColorful('加载页', { text: sceneName }, '的字段', { text: '背景视频上传' }, '未设置');
  }
  const [title, subTitle] = nodes.filter(({ type }) => type === 'Text');
  if (!props[title?.id]?.text || props[title?.id]?.text === '加载页的主标题') {
    yield toColorful('加载页', { text: sceneName }, '的字段', { text: '主标题' }, '未设置');
  }
  if (!props[subTitle?.id]?.text || props[subTitle?.id]?.text === '加载页的副标题') {
    yield toColorful('加载页', { text: sceneName }, '的字段', { text: '副标题' }, '未设置');
  }
}
