import {
  checkSceneCompliance,
  checkSceneDoubleVideo,
  checkSceneLoopVideo,
  checkUseStringAccept,
  ISceneState,
} from '..';

export * from './checkDirectDownloadScript';
export * from './checkPlayableVideoState';
export * from './checkStateDownloadText';
export * from './checkSceneDoubleVideo';
export * from './checkSceneCompliance';
export * from './checkDownloadOpacity';
export * from './checkUseStringAccept';
export * from './checkSceneCompProps';
export * from './checkSceneLoopVideo';
export * from './checkPlayableScene';
export * from './checkPlayableArea';

export function* checkSceneWarnings(scene: ISceneState) {
  for (const checker of [checkSceneCompliance, checkSceneLoopVideo, checkSceneDoubleVideo, checkUseStringAccept]) {
    yield* checker(scene);
  }
}
