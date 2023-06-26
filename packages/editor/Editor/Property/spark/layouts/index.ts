import { ISpace, ICaseState, INodeState, IPanorama, IPanoramaData } from '@editor/aStore';
import { Spark } from '../../cells';

export * from './DragonBones';
export * from './FrameAnime';
export * from './Container';
export * from './Animation';
export * from './Particle';
export * from './Sprite';
export * from './Live2d';
export * from './Lottie';
export * from './Button';
export * from './Scene';
export * from './Sound';
export * from './Video';
export * from './Shape';
export * from './Spine';
export * from './Text';

export * from './3D/MeshSprite3D';
export * from './3D/Animation3D';
export * from './3D/Sprite3D';
export * from './3D/Scene3D';
export * from './3D/Camera';
export * from './3D/Light';
export * from './3D/Model';
export * from './3D/SkinnedMeshSprite3D';
export * from './3D/ShurikenParticle3D';
export * from './3D/Trail3D';
export * from './3D/Particle3D';
export * from './3D/ParticleSystem3D';
export { PanoramaSpace } from './3D/PanoramaSpace';
export * from './3D/PanoramaHotSpot';
export * from './3D/Water';

export * from './Controller';
export * from './Script';
export * from './Effect';
export * from './Blueprint';

export type SparkType =
  | INodeState['type']
  | 'Scene'
  | 'ShurikenParticle3D'
  | 'Script'
  | 'Effect'
  | 'Controller'
  | 'Cubemaps'
  | 'Blueprint';

export type SparkFn = (
  props: {
    id: number;
    nodeId?: number;
    type: INodeState['type'] | 'Scene' | 'ShurikenParticle3D' | 'Script' | 'Effect' | 'Controller';
    multiType?: boolean;
    multiple?: boolean;
  },
  envs: {
    propsMode: ICaseState['editor']['propsMode'];
    rootType: 'Scene' | 'Animation' | 'Animation3D' | 'Model' | 'PlayEffect' | 'useEffect' | 'Particle3D';
    isRoot: boolean;
    scaleMode?: 0 | 1;
    filter?: (group: SparkFn) => boolean;
    enableBlueprint?: boolean;
    typeOfPlay?: number;
    category?: number;
  }
) => Spark;

export type ResourceSparkFn = () => Spark;
export type PanoramaEditSparkFn = (props: { space: ISpace; panorama: IPanorama; panoramaData: IPanoramaData }) => Spark;
