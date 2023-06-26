import useDraggable from '@editor/Resource/common/useDraggable';
import { css } from 'emotion';
import { GroupContainer } from '../../../common/withGroup';
import { ReactComponent as CubeSvg } from './assets/cube-3d.svg';
import { ReactComponent as SquareSvg } from './assets/square.svg';
import { ReactComponent as SphereSvg } from './assets/sphere-3d.svg';
import { ReactComponent as SpotSvg } from './assets/spot.svg';
import { ReactComponent as PointSvg } from './assets/point.svg';
import { ReactComponent as DirectionalSvg } from './assets/directional.svg';
import { ReactComponent as CameraSvg } from './assets/camera.svg';
import { ReactComponent as TrailSvg } from './assets/trail.svg';
import { ReactComponent as MagicSvg } from './assets/magic.svg';
import { ReactComponent as ClickTap } from './assets/clickTap.svg';
import { ReactComponent as Landscape } from './assets/landscape.svg';
import { useSelector } from 'react-redux';
import { ProcessLine } from '@icon-park/react';
import Icon from '@ant-design/icons';
export const ShapeConfig = [
  {
    comp: SquareSvg,
    name: '平面',
    key: 'plane',
  },
  {
    comp: SphereSvg,
    name: '球体',
    key: 'sphere',
  },
  {
    comp: CubeSvg,
    name: '正方体',
    key: 'box',
  },
];

const LightConfig = [
  {
    comp: DirectionalSvg,
    name: '方向光',
    key: 'directional',
  },
  {
    comp: PointSvg,
    name: '点光源',
    key: 'point',
  },
  {
    comp: SpotSvg,
    name: '聚光灯',
    key: 'spot',
  },
];

const CommonConfig = [
  {
    comp: CameraSvg,
    name: '摄像机',
    key: 'camera',
  },
  {
    comp: TrailSvg,
    name: '拖尾',
    key: 'Trail3D',
  },
  {
    comp: MagicSvg,
    name: '粒子容器',
    key: 'Particle3D',
  },
  {
    comp: Landscape,
    name: '全景节点',
    key: 'panoramaSpace',
  },
  {
    comp: ClickTap,
    name: '热点',
    key: 'panoramaHotSpot',
  },
  {
    comp: () => <Icon component={ProcessLine as any} style={{ fontSize: '48px' }} />,
    name: '水面',
    key: 'Water',
  },
];

const Item = ({
  name,
  Comp,
  dragProps,
}: {
  name: string;
  Comp: React.FC;
  dragProps: ReturnType<typeof useDraggable>;
}) => {
  return (
    <div style={{ width: '72px', marginRight: '4px', marginBottom: '8px' }}>
      <div
        className={css({
          height: '72px',
          borderRadius: '2px',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          cursor: 'pointer',
          marginBottom: '4px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          ':nth-child(3n+3)': {
            marginRight: 0, // 每行第三个
          },
        })}
        {...dragProps}
      >
        <Comp />
      </div>
      <div style={{ textAlign: 'center' }}>{name}</div>
    </div>
  );
};

const ShapeItem = ({ name, url, Comp }: { name: string; url: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'MeshSprite3D', name, url });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const LightItem = ({ name, url, Comp }: { name: string; url: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Light', name, url });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const CameraItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Camera', name: '摄像机', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const Trail3DItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Trail3D', name: '拖尾', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const Particle3DItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Particle3D', name: '粒子容器', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const PanoramaSpaceItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'PanoramaSpace', name: '全景节点', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const PanoramaHotSpotItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'PanoramaHotSpot', name: '热点', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const WaterItem = ({ name, Comp }: { name: string; Comp: React.FC }) => {
  const dragProps = useDraggable({ mime: 'Water', name: '水面', url: '' });
  return <Item name={name} Comp={Comp} dragProps={dragProps} />;
};

const ShapeGroup = () => {
  return (
    <GroupContainer
      groups={[
        {
          name: '网格',
          status: 'loaded',
          expandable: true,
          list: ShapeConfig,
          total: ShapeConfig.length,
        },
      ]}
    >
      {groupData => (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
          })}
        >
          {groupData.list.map((item, index) => (
            <ShapeItem key={index} name={item.name} url={item.key} Comp={item.comp} />
          ))}
        </div>
      )}
    </GroupContainer>
  );
};

const LightGroup = () => {
  return (
    <GroupContainer
      groups={[
        {
          name: '光源',
          status: 'loaded',
          expandable: true,
          list: LightConfig,
          total: LightConfig.length,
        },
      ]}
    >
      {groupData => (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
          })}
        >
          {groupData.list.map((item, index) => (
            <LightItem key={index} name={item.name} url={item.key} Comp={item.comp} />
          ))}
        </div>
      )}
    </GroupContainer>
  );
};

const CommonGroup = () => {
  const type = useSelector(({ project }: EditorState) => project.type);

  const showPanoramaHotSpot = type === 'PanoramaData';

  return (
    <GroupContainer
      groups={[
        {
          name: '通用',
          status: 'loaded',
          expandable: true,
          list: CommonConfig,
          total: CommonConfig.length,
        },
      ]}
    >
      {groupData => (
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
          })}
        >
          <CameraItem name={groupData.list[0].name} Comp={groupData.list[0].comp} />
          <Trail3DItem name={groupData.list[1].name} Comp={groupData.list[1].comp} />
          <Particle3DItem name={groupData.list[2].name} Comp={groupData.list[2].comp} />
          <PanoramaSpaceItem name={groupData.list[3].name} Comp={groupData.list[3].comp} />
          <WaterItem name={groupData.list[5].name} Comp={groupData.list[5].comp} />
          {showPanoramaHotSpot && <PanoramaHotSpotItem name={groupData.list[4].name} Comp={groupData.list[4].comp} />}
        </div>
      )}
    </GroupContainer>
  );
};

const Basic3D = () => {
  return (
    <>
      <ShapeGroup />
      <LightGroup />
      <CommonGroup />
    </>
  );
};

export default Basic3D;
