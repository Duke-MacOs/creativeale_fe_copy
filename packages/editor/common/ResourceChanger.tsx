import React from 'react';
import { Category, useSettings } from '@editor/aStore';
import Effect from '../Resource/entries/2d/Effect';
import Image from '../Resource/entries/2d/Image';
import Sound from '../Resource/entries/2d/Sound';
import Video, { NativeLoadingVideo, PVAlphaVideo, NativeVideo, VRVideo } from '../Resource/entries/2d/Video';
import Cubemaps from '../Resource/entries/3d/Cubemaps';
import Texture2D from '../Resource/entries/3d/Texture2D';
import Comp from '../Resource/entries/2d/Comp';
import Model from '../Resource/entries/3d/Model';
import withDraggableModal from './withDraggableModal';
import Comp3D from '@editor/Resource/entries/3d/Comp3D';
export interface ResourceChangerProps {
  eleType: Category;
  acceptFiles?: (files: File[]) => File[];
  onChange(props: {
    name: string;
    url: string | number;
    _from?: string;
    cover?: string;
    orderId?: number;
    extra?: Record<string, any>;
  }): void;
}
export interface ModalProps extends ResourceChangerProps {
  title?: string;
  onClose: () => void;
}
export const ChangerContext = React.createContext(
  {} as Partial<Pick<ResourceChangerProps, 'onChange' | 'acceptFiles'>>
);

const select = (eleType: string) => {
  switch (eleType) {
    case 'Sprite':
      return <Image />;
    case 'Sound':
      return <Sound />;
    case 'NativeLoadingVideo':
      return <NativeLoadingVideo />;
    case 'AlphaVideo':
    case 'PVAlphaVideo':
      return <PVAlphaVideo />;
    case 'NativeVideo':
      return <NativeVideo />;
    case 'Video':
      return <Video />;
    case 'VRVideo':
      return <VRVideo />;
    case 'Animation':
    case 'CustomScript':
      return <Comp defaultCategory={eleType as any} />;
    case 'Animation3D':
      return <Comp3D />;
    case 'Lottie':
    case 'FrameAnime':
    case 'Particle':
    case 'DragonBones':
    case 'Spine':
      return <Effect defaultCategory={eleType} />;
    case 'Cubemaps':
      return <Cubemaps />;
    case 'Model':
      return <Model />;
    case 'Texture2D':
      return <Texture2D />;
    default:
      return null;
  }
};
const ResourceChanger = ({ eleType, onChange, acceptFiles }: ResourceChangerProps) => {
  const typeOfPlay = useSettings('typeOfPlay');
  const category = useSettings('category');
  const isVRVideo = typeOfPlay === 3 && category === 3;
  if (isVRVideo && eleType === 'Video') {
    eleType = 'VRVideo';
  }
  return <ChangerContext.Provider value={{ onChange, acceptFiles }}>{select(eleType)}</ChangerContext.Provider>;
};

const ResourceChangerCreator = ({ selector = '', top = 4, left = -280 - 4 }: any = {}) => {
  const DraggingModal = withDraggableModal(ResourceChanger, '更换资源', 280, `${selector ?? Date.now()}}`);
  return (props: ModalProps) => {
    let pos = { top: 0, left: 0 };
    if (selector) {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      if (rect) {
        pos = { top: rect.top + top, left: rect.left + left };
      }
    }
    return <DraggingModal {...props} defaultPos={pos} defaultHeight={520} />;
  };
};

export default ResourceChangerCreator;
