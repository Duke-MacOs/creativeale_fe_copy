import Icon, { PlusOutlined } from '@ant-design/icons';
import { IPanorama, IPanoramaEdit, ISpace, useEditor } from '@editor/aStore';
import { useEffect, useState } from 'react';
import { Delete } from '@icon-park/react';
import { getCubemapByOrderId } from '@editor/utils';
import { useStore } from 'react-redux';
import { Empty, Menu, Dropdown, Button, message, theme } from 'antd';

export default ({
  space,
  panoramas,
  panoramaEdit,
  onClickSpace,
  onClickPanorama,
  onAddPanorama,
  onDelPanorama,
  onDelSpace,
}: {
  space: ISpace;
  panoramas: IPanorama[];
  panoramaEdit: IPanoramaEdit;
  onClickSpace: () => void;
  onClickPanorama: (panoramaId: number) => void;
  onAddPanorama: () => void;
  onDelPanorama: (panoramaId: number) => void;
  onDelSpace: () => void;
}) => {
  const { token } = theme.useToken();
  const { getState } = useStore();
  const { propsMode } = useEditor(0, 'propsMode');
  const [selectedId, setSelectedId] = useState(panoramaEdit.panoramaId);
  const [delVisible, setDelVisible] = useState(0);
  const [addPanoramaLoading, setAddPanoramaLoading] = useState(false);
  useEffect(() => {
    if (panoramaEdit.type) {
      setSelectedId(panoramaEdit.type === 'panorama' ? panoramaEdit.panoramaId : panoramaEdit.spaceId);
    }
  }, [panoramaEdit]);

  const menu = (
    <Menu>
      <Menu.Item key={1} onClick={onDelSpace}>
        删除
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['contextMenu']}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '10px',
          padding: '5px',
          background: token.colorBgLayout,
          border: selectedId === space.id ? `2px solid ${token.colorPrimary}` : '',
        }}
        onClick={onClickSpace}
      >
        <span>{space.name}</span>
        {panoramas.map(panorama => {
          const cover = getCubemapByOrderId(getState().project, panorama.cubemapUrl)?.cover;
          return (
            <div
              key={panorama.id}
              style={{
                position: 'relative',
                marginBottom: '2px',
                border: selectedId === panorama.id ? `2px solid ${token.colorPrimaryBorder}` : '',
              }}
              onClick={event => {
                event.stopPropagation();
                onClickPanorama(panorama.id);
              }}
              onMouseEnter={() => {
                setDelVisible(panorama.id);
              }}
              onMouseLeave={() => {
                setDelVisible(0);
              }}
            >
              {cover ? (
                <img
                  src={cover}
                  style={{
                    width: '120px',
                    height: '120px',
                  }}
                />
              ) : (
                <Empty imageStyle={{ height: '50px' }} image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无封面" />
              )}
              <Icon
                style={{
                  position: 'absolute',
                  right: 10,
                  top: 5,
                  padding: '2px',
                  fontSize: '12px',
                  color: 'white',
                  display: delVisible === panorama.id ? 'block' : 'none',
                  background: 'rgba(0,0,0,.5)',
                }}
                component={Delete as any}
                onClick={event => {
                  event.stopPropagation();
                  onDelPanorama(panorama.id);
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  fontSize: '11px',
                  background: 'rgba(0,0,0,.5)',
                  color: 'white',
                  padding: '2px',
                }}
              >
                {panorama.name}
              </div>
            </div>
          );
        })}
        {propsMode === 'Project' && (
          <Button
            style={{ marginTop: '10px' }}
            loading={addPanoramaLoading}
            onClick={async e => {
              e.stopPropagation();
              setAddPanoramaLoading(true);
              try {
                await onAddPanorama();
              } catch (e) {
                console.error('创建 Panorama 失败：', e);
                message.error('创建全景失败');
              } finally {
                setAddPanoramaLoading(false);
              }
            }}
          >
            <PlusOutlined style={{ fontSize: '16px' }} />
            新增全景
          </Button>
        )}
      </div>
    </Dropdown>
  );
};
