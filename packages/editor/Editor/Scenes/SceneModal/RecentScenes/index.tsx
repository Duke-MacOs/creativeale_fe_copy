import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import { getUseHistory } from '@shared/api/library';
import { IMaterial } from '@/types/library';
import { ScenesSection, ActiveKey } from '..';
import empty from './empty.png';

export default function RecentScenes({
  activeKey,
  visible,
  search,
  onFinish,
}: {
  activeKey: string;
  visible: boolean;
  search: string;
  onFinish: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [scenesList, setScenesList] = useState<IMaterial[]>(null as any);

  useEffect(() => {
    if (visible && activeKey === ActiveKey.Recent) {
      setLoading(true);
      getUseHistory({
        types: 26,
        keyword: search || '',
      }).then(({ list }: Record<string, IMaterial[]>) => {
        setScenesList(list);
        setLoading(false);
      });
    }
  }, [activeKey, search, visible]);

  if (scenesList) {
    if (scenesList.length) {
      return (
        <Spin spinning={loading}>
          <div style={{ height: 580, padding: '16px 24px', overflowY: 'auto' }}>
            <ScenesSection
              scenesList={scenesList}
              onFinish={onFinish}
              title={search ? `"${search}"的搜索结果` : undefined}
            />
          </div>
        </Spin>
      );
    } else {
      return (
        <Spin spinning={loading}>
          <div style={{ height: 580, padding: '16px 24px' }}>
            <Empty imageStyle={{ height: 260, marginTop: 130 }} image={empty} description="未找到最近使用的场景模板" />
          </div>
        </Spin>
      );
    }
  } else {
    return (
      <Spin spinning={loading}>
        <div style={{ height: 580, padding: '16px 24px' }} />
      </Spin>
    );
  }
}
