import { ICaseState } from '../types';
import changeCanvasScale from './changeCanvasScale';
import reorderScene from './reorderScene';
import changeEditor from './changeEditor';
import addComponent from './addComponent';
import addCustomScript from './addCustomScript';
import deleteCustomScript from './deleteCustomScript';
import updateCustomScript from './updateCustomScript';
import resetCustomScripts from './resetCustomScripts';
import updateGlobalVars from './updateGlobalVars';
import addMaterial from './addMaterial';
import updateMaterial from './updateMaterial';
import deleteMaterial from './deleteMaterial';
import changeProps from './changeProps';
import setSettings from './setSettings';
import deleteScene from './deleteScene';
import playScript from './playScript';
import addScene from './addScene';
import updateLayerCollisions from './updateLayerCollisions';
import updateLayerCollisionName from './updateLayerName';
import deleteLayerCollisions from './deleteLayerCollisions';
import deleteLayerName from './deleteLayerName';
import addCubeMap from './addCubeMap';
import deleteCubeMap from './deleteCubeMap';
import updateCubeMap from './updateCubemap';
import addPanoramaViewer from './addPanoramaData';
import deletePanoramaViewer from './deletePanoramaData';
import updatePanoramaData from './updatePanoramaData';
import addTexture2D from './addTexture2D';
import updateTexture2D from './updateTexture2D';
export * from './changeCanvasScale';
export * from './addComponent';
export * from './addMaterial';
export * from './updateMaterial';
export * from './addCustomScript';
export * from './deleteCustomScript';
export * from './updateCustomScript';
export * from './resetCustomScripts';
export * from './reorderScene';
export * from './deleteScene';
export * from './setSettings';
export * from './playScript';
export * from './addScene';
export * from './deleteMaterial';
export * from './updateLayerCollisions';
export * from './updateLayerName';
export * from './deleteLayerCollisions';
export * from './deleteLayerName';
export * from './addCubeMap';
export * from './deleteCubeMap';
export * from './updateCubemap';
export * from './addPanoramaData';
export * from './deletePanoramaData';
export * from './updatePanoramaData';
export * from './updateGlobalVars';
export * from './addTexture2D';
export * from './updateTexture2D';

const reducers = [
  changeEditor,
  changeProps,
  playScript,
  addScene,
  addComponent,
  addCustomScript,
  addMaterial,
  updateMaterial,
  deleteCustomScript,
  updateCustomScript,
  updateGlobalVars,
  resetCustomScripts,
  reorderScene,
  deleteScene,
  changeCanvasScale,
  setSettings,
  deleteMaterial,
  updateLayerCollisions,
  updateLayerCollisionName,
  deleteLayerCollisions,
  deleteLayerName,
  addCubeMap,
  deleteCubeMap,
  updateCubeMap,
  addPanoramaViewer,
  deletePanoramaViewer,
  updatePanoramaData,
  addTexture2D,
  updateTexture2D,
];
export type StateReducerAction = Parameters<(typeof reducers)[number]>[1];
export default (state: ICaseState, action: any): ICaseState => {
  for (const reducer of reducers) {
    const newState = reducer(state, action);
    if (newState !== state) {
      return newState;
    }
  }
  return state;
};
