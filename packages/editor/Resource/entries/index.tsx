import { ICaseState } from '@editor/aStore';
import {
  Pic,
  Music,
  PlayTwo,
  FontSize,
  GraphicDesign,
  FigmaComponent,
  Effects as EffectIcon,
  PeopleDownload,
  GridFour,
  PanoramaHorizontal,
  Tool,
  Magic,
} from '@icon-park/react';
import { Button, Effect, Shape, Video, Image, Sound, Comp, Text } from './2d';
import { Model, Cubemaps, Comp3D, Basic3D, Particle3D } from './3d';

export default ({
  type,
  edit3d,
  typeOfPlay,
  propsMode,
}: {
  type: string;
  edit3d?: boolean;
  typeOfPlay?: number;
  propsMode: ICaseState['editor']['propsMode'];
}) => {
  if (edit3d) {
    if (propsMode === 'Product')
      return [
        {
          key: 'Animation',
          hide: ['Model', 'Particle3D'].includes(type),
          comp: <Comp3D />,
          name: '组件',
          icon: <FigmaComponent theme="outline" size="22" />,
        },
      ];
    return [
      {
        key: 'Animation',
        hide: ['Model', 'Particle3D'].includes(type),
        comp: <Comp3D />,
        name: '组件',
        icon: <FigmaComponent theme="outline" size="22" />,
      },
      {
        key: 'Basic3D',
        hide: ['Particle3D'].includes(type),
        comp: <Basic3D />,
        name: '基础',
        icon: <Tool theme="outline" size="22" />,
      },
      {
        key: 'Model',
        hide: ['Particle3D'].includes(type),
        comp: <Model />,
        name: '模型',
        icon: <GridFour theme="outline" size="22" />,
      },
      { key: 'Particle3D', comp: <Particle3D />, name: '粒子', icon: <Magic theme="outline" size="22" /> },
      {
        key: 'Cubemaps',
        hide: type !== 'Project',
        comp: <Cubemaps />,
        name: '天空盒',
        icon: <PanoramaHorizontal theme="outline" size="22" />,
      },
    ].filter(({ hide = false }) => !hide);
  }
  return [
    { key: 'Animation', comp: <Comp />, name: '组件', icon: <FigmaComponent theme="outline" size="22" /> },
    { key: 'Sprite', comp: <Image />, name: '图片', icon: <Pic theme="outline" size="22" /> },
    { key: 'Video', comp: <Video />, name: '视频', icon: <PlayTwo theme="outline" size="22" /> },
    { key: 'Sound', comp: <Sound />, name: '声音', icon: <Music theme="outline" size="22" /> },
    { key: 'effect', comp: <Effect />, name: '动效', icon: <EffectIcon theme="outline" size="22" /> },
    { key: 'Text', comp: <Text />, name: '文字', icon: <FontSize theme="outline" size="22" /> },
    { key: 'Shape', comp: <Shape />, name: '图形', icon: <GraphicDesign theme="outline" size="22" /> },
    {
      key: 'Button',
      hide: typeOfPlay !== 0,
      comp: <Button />,
      name: '转化',
      icon: <PeopleDownload theme="outline" size="22" />,
      tips: {
        title: '新增转化按钮',
        content: '“APP下载”事件已下线，新增“转化”按钮，直接使用即可实现“APP下载”事件部署，无需编排事件。',
      },
    },
  ].filter(({ hide = false }) => !hide);
};
