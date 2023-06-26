import { TooltipHelp } from '@editor/Editor/Property/cells';
import { typeLabel } from '../../headerGroup/typeLabel';
import { ReactNode } from 'react';

export default function baseTypeLabel(type: any, baseType: any = type): ReactNode {
  if (baseType === type) {
    switch (type) {
      case 'FrameAnime':
        return (
          <>
            {typeLabel(type)}
            <TooltipHelp title="序列帧是一种动画格式，其动画由一帧一帧的图片依次播放而成的" />
          </>
        );
      case 'DragonBones':
      case 'Spine':
        return (
          <>
            {typeLabel(type)}
            <TooltipHelp title={`${typeLabel(type)}是一种常用的骨骼动画`} />
          </>
        );
      case 'Particle':
        return (
          <>
            {typeLabel(type)}
            <TooltipHelp title="粒子系统是一种动画，具体来说比如暴风雪、水流、爆炸、烟雾等" />
          </>
        );
      case 'Live2d':
        return (
          <>
            {typeLabel(type)}
            <TooltipHelp title="Live2D是一种通过一系列的连续图像和人物建模来生成一种类似三维模型的二维图像的绘图渲染技术" />
          </>
        );
      case 'Lottie':
        return (
          <>
            {typeLabel(type)}
            <TooltipHelp title="Lottie动画是一种动画格式，通过After Effects软件可以导出Lottie动画，然后上传到编辑器内使用" />
          </>
        );
      default:
        return typeLabel(type);
    }
  }
  return `${typeLabel(baseType)}${baseTypeLabel(type)}`;
}
