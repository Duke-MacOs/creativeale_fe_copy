import { useState } from 'react';
import { message } from 'antd';
import { usePersistCallback } from '@byted/hooks';
import { IMaterial } from '@/types/library';
import { Category, GroupList, ICubemap, ISceneState, useEmitter } from '../../../aStore';
import { fetchResource } from '../updateResource';
import { shallowEqual, useSelector } from 'react-redux';

export default (teamId: string, projectId: number, category: Category) => {
  const [groupData, setGroupData] = useState<GroupList<IMaterial | ISceneState | ICubemap>[number] | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const { scenes, cubemaps } = useSelector(
    ({ project: { scenes, cubemaps } }: EditorState) => ({ scenes, cubemaps }),
    shallowEqual
  );
  useEmitter(
    'ResourceDeleted',
    usePersistCallback(id => {
      setGroupData(groupData => {
        if (!groupData) return groupData;
        return {
          ...groupData,
          list: groupData.list.filter(item => item.id !== id),
        };
      });
    })
  );

  const fetchSearchData = async (keyword: any, expandedGroup: any, searchData: any, provider: any) => {
    if (keyword === undefined && !expandedGroup) {
      setLoadingData(false);
      setGroupData(null);
      return;
    }
    if (['Animation', 'Animation3D', 'Model', 'Particle3D'].includes(category)) {
      const list = scenes.filter(i => i.type === category && i.name.includes(keyword));
      setGroupData({
        name: expandedGroup ? expandedGroup.name : '',
        list,
        total: list.length,
        expandable: false,
        status: 'loaded',
      });
      return;
    }
    if (category === 'Cubemaps') {
      const list = cubemaps.filter(i => i.name.includes(keyword));
      setGroupData({
        name: expandedGroup ? expandedGroup.name : '',
        list,
        total: list.length,
        expandable: false,
        status: 'loaded',
      });
      return;
    }

    try {
      setLoadingData(true);
      const { materialList, pagination } = await fetchResource(
        teamId,
        projectId,
        provider,
        Math.floor((searchData?.list.length ?? 0) / 99) + 1,
        99,
        category,
        expandedGroup?.tagId || 0,
        keyword,
        expandedGroup?.categoryId
      );
      if (searchData) {
        setGroupData({
          ...searchData,
          list: searchData.list.concat(materialList),
        });
      } else {
        setGroupData({
          name: expandedGroup ? expandedGroup.name : '',
          list: materialList,
          total: pagination.total,
          expandable: false,
          status: 'loaded',
        });
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoadingData(false);
    }
  };
  return { groupData, loadingData, fetchSearchData, setGroupData };
};
