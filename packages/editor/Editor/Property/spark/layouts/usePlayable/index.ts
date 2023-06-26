import { useSelector, useStore } from 'react-redux';
import { changeProps } from '@editor/aStore';
import { PlayableSettings as content } from './schema/index';
import { getScene } from '@editor/utils';
import render, { Spark } from '../../../cells';
import { useForceSceneReload } from '@editor/Preview';

export function PlayableSettings() {
  const playableSettings = usePlayableSettings();
  return render(playableSettings);
}

export const usePlayableSettings = (): Spark => {
  const { dispatch } = useStore<EditorState, EditorAction>();
  const forceReloadScene = useForceSceneReload();

  const scene = useSelector(({ project }: EditorState) => getScene(project));
  return {
    spark: 'context',
    content,
    provide: () => {
      const [color] = scene.nodes.filter(({ type }) => type === 'Sprite');
      const [title, subTitle] = scene.nodes.filter(({ type }) => type === 'Text');
      const [icon] = scene.nodes.filter(({ type }) => type === 'FrameAnime'); // 更老的直出项目中不是使用序列帧，而是带动画脚本的图片实现
      return {
        useValue(index) {
          switch (index) {
            case 'title':
              return {
                value: [scene.props[title.id].text] as any,
                onChange([text]: any) {
                  dispatch(changeProps([title.id], { text }));
                },
              };
            case 'subTitle':
              return {
                value: [scene.props[subTitle.id].text] as any,
                onChange([text]: any) {
                  dispatch(changeProps([subTitle.id], { text }));
                },
              };
            case 'color':
              return {
                value: [scene.props[color.id].color] as any,
                onChange([colorValue]: any) {
                  dispatch(changeProps([color.id], { color: colorValue }));
                },
              };
            case 'icon':
              return {
                value: [
                  scene.props[icon?.id]?.url ===
                  'material/private/preview/4b3f06ff990f5b0e0ff59f4030bf74a1/sequence.json' // 兼容老数据
                    ? 'material/preview/e6079c7c05f93532a3e1b87dc7f541da/sequence.json'
                    : scene.props[icon?.id]?.url,
                ] as any,
                onChange([url]: any) {
                  if (icon?.id) {
                    dispatch(changeProps([icon.id], { url }));
                    forceReloadScene();
                  }
                },
              };
            default:
              return {
                value: [],
                onChange() {
                  throw new Error();
                },
              };
          }
        },
      };
    },
  };
};
