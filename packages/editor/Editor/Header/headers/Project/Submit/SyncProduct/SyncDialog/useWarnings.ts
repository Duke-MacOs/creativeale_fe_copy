import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { checkDownloadOpacity, checkSceneWarnings } from '@editor/aStore';
import { cleanProject, findById } from '@editor/utils';
import { toColorful } from '@shared/utils';
import { sumBy } from 'lodash';

export default (firstSceneSize = 0) => {
  const project = useSelector(({ project }: EditorState) => project);
  const [warnings, setWarnings] = useState([] as (JSX.Element | string)[]);
  useEffect(() => {
    projectWarnings(cleanProject(project)).then(setWarnings);
  }, [project]);
  if (firstSceneSize > 1.5 * 1024 * 1024) {
    return ['首个主场景中的素材资源建议不超过1.5M。不要放置较大视频和大量序列帧，以免影响加载完成率', ...warnings];
  }
  return warnings;
};

const projectWarnings = async (state: EditorState['project']) => {
  const warnings = [] as (JSX.Element | string)[];
  const main = state.scenes.find(({ type, editor: { loading } }) => type === 'Scene' && !loading);
  if (
    main &&
    Object.entries(main.props).some(
      ([id, { type, time }]) =>
        type === 'Controller' && (time as number) < 16 && findById(main.nodes, Number(id), true)[0].type === 'Video'
    )
  ) {
    warnings.push(toColorful(`主场景“`, { text: main.name }, `”使用视频作为首帧可能导致开始互动率偏低，建议慎用`));
  }
  for (const message of checkDownloadOpacity(state)) {
    if (await message) {
      warnings.push((await message) as any);
    }
  }
  if (sumBy(state.scenes, ({ props }) => sumBy(Object.values(props), ({ type }) => Number(type === 'Video'))) > 6) {
    warnings.push('作品中的视频总数建议不超过6个，可能导致卡顿等问题');
  }
  return warnings.concat(
    state.scenes
      .reduce((warnings, scene) => warnings.concat(Array.from(checkSceneWarnings(scene))), [] as any[])
      .map(({ message }) => message)
  );
};
