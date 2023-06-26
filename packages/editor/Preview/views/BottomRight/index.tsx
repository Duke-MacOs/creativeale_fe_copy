import CanvasScale from './CanvasScale';
import ResetScale from './ResetScale';
import { memo } from 'react';
import SceneBlueprint from './SceneBlueprint';
import { css } from 'emotion';
import Text2Image from './Text2Image';
import { useHasFeature } from '@shared/userInfo';

export default memo(({ bottom = 16, blueprint }: any) => {
  const hasClabFeature = useHasFeature();

  return (
    <div
      className={css({
        position: 'absolute',
        display: 'flex',
        bottom,
        right: 16,
        columnGap: 8,
      })}
    >
      {hasClabFeature && <Text2Image />}
      <CanvasScale />
      <ResetScale />
      {blueprint && <SceneBlueprint />}
    </div>
  );
});
