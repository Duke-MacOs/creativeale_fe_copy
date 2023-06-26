import React, { useState, useEffect } from 'react';
import { Empty, Spin } from 'antd';
import { fetchMaterialList, fetchMaterialTag } from '@shared/api/library';
import { IMaterial } from '@/types/library';
import { ScenesSection, ActiveKey, styles } from '..';
import empty from './empty.png';
import { collectEvent, EventTypes } from '@editor/utils';

export default function PublicScenes({
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
  const [currentTag, setCurrentTag] = useState<{ id: string; name: string }>({ id: '0', name: '全部' });
  const handleSelectTag = (tag: Record<string, any>) => {
    setCurrentTag({ id: tag.id, name: tag.name });
  };
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [scenesList, setScenesList] = useState<IMaterial[]>(null as any);
  useEffect(() => {
    fetchMaterialTag({
      category: 9,
      pageSize: 999,
      origin: 1,
      parentName: '场景',
    }).then(({ tags }: { tags: Array<{ id: string; name: string }> }) => {
      tags.sort((a, b) => {
        if (b.id === '112001' && b.name === '其他') {
          return -1;
        }
        return 1;
      });
      setTags(tags);
    });
  }, []);

  useEffect(() => {
    if (visible && activeKey === ActiveKey.Public) {
      setLoading(true);
      fetchMaterialList(
        Object.assign(
          {
            page: 1,
            pageSize: 999,
            sort: 'created_at desc',
            types: '26',
            statuses: '1',
            onPlatform: true,
          },
          search ? { keyword: search } : {},
          currentTag.id !== '0' ? { tagIds: currentTag.id } : {}
        )
      ).then(({ materialList }) => {
        setScenesList(materialList);
        setLoading(false);
      });
    }
  }, [activeKey, currentTag, search, visible]);

  if (search) {
    if (scenesList?.length) {
      return (
        <Spin spinning={loading}>
          <div style={{ height: 580, padding: '16px 24px', overflowY: 'auto' }}>
            <ScenesSection scenesList={scenesList} title={`"${search}"的搜索结果`} onFinish={onFinish} />
          </div>
        </Spin>
      );
    } else {
      return (
        <div style={{ height: 580, padding: '16px 24px' }}>
          <Empty
            imageStyle={{ height: 260, marginTop: 130 }}
            image={empty}
            description="未找到符合搜索条件的场景模板"
          />
        </div>
      );
    }
  }
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          flexBasis: 190,
          boxShadow: '0px 2px 4px 0px #00000025',
          marginTop: 16,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '580px',
          overflow: 'scroll',
        }}
      >
        <a
          style={{ padding: '12px 12px 12px 40px', cursor: 'pointer' }}
          className={currentTag.id === '0' ? styles.selectedType : ''}
          onClick={() => handleSelectTag({ id: '0', name: '全部' })}
        >
          全部
        </a>
        {tags.map(tag => (
          <a
            key={tag.id}
            style={{ padding: '12px 12px 12px 40px', cursor: 'pointer' }}
            className={currentTag.id === tag.id ? styles.selectedType : ''}
            onClick={() => {
              handleSelectTag(tag);
              collectEvent(EventTypes.SceneLibrary, {
                type: '分类选择',
                value: tag.name,
              });
            }}
          >
            {tag.name}
          </a>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        {scenesList ? (
          scenesList.length ? (
            <Spin spinning={loading}>
              <div style={{ height: 580, padding: '16px 24px', overflow: 'scroll' }}>
                <ScenesSection title={currentTag.name} onFinish={onFinish} scenesList={scenesList as any} />
              </div>
            </Spin>
          ) : (
            <Spin spinning={loading}>
              <div style={{ height: 580, padding: '16px 24px' }}>
                <Empty
                  imageStyle={{ height: 260, marginTop: 130 }}
                  image={empty}
                  description="未找到符合搜索条件的场景模板"
                />
              </div>
            </Spin>
          )
        ) : (
          <Spin spinning={loading}>
            <div style={{ height: 580, padding: '16px 24px' }} />
          </Spin>
        )}
      </div>
    </div>
  );
}
