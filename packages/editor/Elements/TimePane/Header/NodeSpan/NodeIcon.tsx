import { INodeData } from '@byted/riko';
import Icon, { FontColorsOutlined, PictureOutlined } from '@ant-design/icons';
import {
  FigmaComponent,
  MultiRectangle,
  PeopleDownload,
  GraphicDesign,
  StereoPerspective,
  CoordinateSystem,
  VideocameraOne,
  FileQuestion,
  FolderOpen,
  FigmaMask,
  Windmill,
  Selected,
  Endless,
  PlayTwo,
  Effects,
  Music,
  Bone,
  Light,
  Cube,
  Girl,
  BubbleChart,
  MovieBoard,
  RightRun,
  Magic,
  PanoramaHorizontal,
  ClickTap,
  MindMapping,
  Move,
  Point,
  CarouselVideo,
} from '@icon-park/react';
export interface TypeIconProps {
  type: INodeData['type'];
  style?: Record<string, unknown>;
  asMask?: boolean;
}

const MaskIcon = (props: any) => <FigmaMask {...props} theme="filled" />;

export default function TypeIcon({ type, asMask }: TypeIconProps) {
  if (asMask) {
    return <Icon component={MaskIcon} />;
  }
  switch (type) {
    case 'DragonBones':
      return <Icon component={Bone as any} />;
    case 'Spine':
      return <Icon component={Endless as any} />;
    case 'Controller':
      return <Icon component={Selected as any} />;
    case 'Scene':
      return <Icon component={MovieBoard as any} />;
    case 'Sound':
    case 'PVSound':
    case 'VRSound':
      return <Icon component={Music as any} />;
    case 'Video':
    case 'PVVideo':
    case 'VRVideo':
      return <Icon component={PlayTwo as any} />;
    case 'PVAlphaVideo':
    case 'AlphaVideo':
      return <Icon component={CarouselVideo as any} />;
    case 'Text':
    case 'PVText':
    case 'VRText':
      return <FontColorsOutlined />;
    case 'Shape':
    case 'PVClickArea':
      return <Icon component={GraphicDesign as any} />;
    case 'PVFrameAnime':
    case 'FrameAnime':
      return <Icon component={MultiRectangle as any} />;
    case 'Particle':
      return <Icon component={Effects as any} />;
    case 'Lottie':
      return <Icon component={Windmill as any} />;
    case 'Animation':
    case 'Animation3D':
      return <Icon component={FigmaComponent as any} />;
    case 'Container':
    case 'Sprite3D':
      return <Icon component={FolderOpen as any} />;
    case 'Button':
    case 'PVButton':
    case 'VRButton':
      return <Icon component={PeopleDownload as any} />;
    case 'PVDragger':
    case 'PVSlider':
      return <Icon component={Move as any} />;
    case 'PVGuider':
      return <Icon component={Point as any} />;
    case 'Camera':
      return <Icon component={VideocameraOne as any} />;
    case 'Light':
      return <Icon component={Light as any} />;
    case 'MeshSprite3D':
      return <Icon component={StereoPerspective as any} />;
    case 'SkinnedMeshSprite3D':
      return <Icon component={StereoPerspective as any} />;
    case 'Scene3D':
      return <Icon component={CoordinateSystem as any} />;
    case 'Model':
      return <Icon component={Cube as any} />;
    case 'Live2d':
      return <Icon component={Girl as any} />;
    case 'Sprite':
    case 'PVSprite':
    case 'VRSprite':
      return <PictureOutlined />;
    case 'Particle3D':
    case 'ParticleSystem3D':
      return <Icon component={Magic as any} />;
    case 'ShurikenParticle3D':
      return <Icon component={BubbleChart as any} />;
    case 'Trail3D':
      return <Icon component={RightRun as any} />;
    case 'PanoramaSpace':
      return <Icon component={PanoramaHorizontal as any} />;
    case 'PanoramaHotSpot':
      return <Icon component={ClickTap as any} />;
    case 'Blueprint':
      return <Icon component={MindMapping as any} />;
    default:
      return <Icon component={FileQuestion as any} />;
  }
}
