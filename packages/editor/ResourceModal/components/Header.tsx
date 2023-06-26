import { Divider, Input, Radio, Space } from 'antd';
import { Dimension, ResourceTypeInModal, SidebarType } from '../type';
import {
  Pic,
  Music,
  PlayTwo,
  FontSize,
  FigmaComponent,
  Effects as EffectIcon,
  GridFour,
  Magic,
} from '@icon-park/react';
import { ReactNode, useMemo } from 'react';
import { useModalState } from '../Context';
import React from 'react';
import shallow from 'zustand/shallow';
import { IRequestProps } from '../hooks/useRequest';
import { useProject } from '@editor/aStore';

type Props = {
  dimension: Dimension;
  resourceType: ResourceTypeInModal;
  onChangeDimension: (val: Dimension) => void;
  onChangeResourceType: (type: ResourceTypeInModal) => void;
};

type ResourceItemProps = {
  value: ResourceTypeInModal;
  name: string;
  icon: ReactNode;
};

const options2D = [{ label: '2D', value: Dimension.D2 }];

const options3D = [
  { label: '2D', value: Dimension.D2 },
  { label: '3D', value: Dimension.D3 },
];

const ResourceConfig2D: ResourceItemProps[] = [
  { value: ResourceTypeInModal.Component2D, name: '组件', icon: <FigmaComponent theme="outline" size="22" /> },
  { value: ResourceTypeInModal.Image, name: '图片', icon: <Pic theme="outline" size="22" /> },
  { value: ResourceTypeInModal.Video, name: '视频', icon: <PlayTwo theme="outline" size="22" /> },
  { value: ResourceTypeInModal.Audio, name: '声音', icon: <Music theme="outline" size="22" /> },
  { value: ResourceTypeInModal.Effect, name: '动效', icon: <EffectIcon theme="outline" size="22" /> },
  { value: ResourceTypeInModal.Text, name: '文字', icon: <FontSize theme="outline" size="22" /> },
];

const ResourceConfig3D: ResourceItemProps[] = [
  {
    value: ResourceTypeInModal.Component3D,
    name: '组件',
    icon: <FigmaComponent theme="outline" size="22" />,
  },
  {
    value: ResourceTypeInModal.Model,
    name: '模型',
    icon: <GridFour theme="outline" size="22" />,
  },
  { value: ResourceTypeInModal.Particle, name: '粒子', icon: <Magic theme="outline" size="22" /> },
];

const ResourceItem = ({
  value,
  name,
  icon,
  selected,
  onChangeResourceType,
}: ResourceItemProps & { selected: boolean } & Pick<Props, 'onChangeResourceType'>) => {
  return (
    <div
      key={value}
      style={{
        color: selected ? 'blue' : 'unset',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={() => {
        onChangeResourceType(value);
      }}
    >
      {icon}
      {name}
    </div>
  );
};

export default React.memo(({ onFetchData }: { onFetchData: (params?: Partial<IRequestProps>) => void }) => {
  const { enabled3d } = useProject('settings');
  const { sidebarType, keyword, resourceType, dimension, updateModalState } = useModalState(
    state => ({
      sidebarType: state.modalState.sidebarType,
      keyword: state.modalState.keyword,
      resourceType: state.modalState.resourceType,
      dimension: state.modalState.dimension,
      updateModalState: state.updateModalState,
    }),
    shallow
  );

  const onChangeDimension = (val: Dimension) => {
    updateModalState({
      categoryId: '1',
      dimension: val,
      resourceType: val === Dimension.D2 ? ResourceTypeInModal.Component2D : ResourceTypeInModal.Component3D,
    });
  };

  const onChangeResourceType = (type: ResourceTypeInModal) => {
    updateModalState({
      categoryId: '1',
      resourceType: type,
    });
  };

  const resourceConfig = useMemo(() => {
    return dimension === Dimension.D2 ? ResourceConfig2D : ResourceConfig3D;
  }, [dimension]);

  return sidebarType === SidebarType.AI ? null : (
    <>
      <div style={{ position: 'relative' }}>
        <Space size="large" style={{ padding: '0 24px' }}>
          <Radio.Group
            options={enabled3d ? options3D : options2D}
            onChange={e => {
              onChangeDimension(e.target.value);
            }}
            value={dimension}
            optionType="button"
          />
          <Space size="middle">
            {resourceConfig.map(i => (
              <ResourceItem {...i} selected={resourceType === i.value} onChangeResourceType={onChangeResourceType} />
            ))}
          </Space>
        </Space>
        <Input.Search
          style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translate(-50%, -50%)', width: 200 }}
          placeholder="搜索关键词"
          allowClear
          value={keyword}
          onChange={e => {
            updateModalState({ keyword: e.target.value });
          }}
          onSearch={val => {
            updateModalState({ keyword: val });
            onFetchData({ keyword: val });
          }}
        />
      </div>
      <Divider style={{ marginTop: '12px', marginBottom: 0 }} />
    </>
  );
});
