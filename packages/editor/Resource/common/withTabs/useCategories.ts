import { usePersistCallback } from '@byted/hooks';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IMaterial } from '@/types/library';
import {
  GroupList,
  Category,
  Provider,
  changeProvider,
  changeDatabase,
  ResourceEntry,
  useSettings,
} from '@editor/aStore';
import updateResource from '../updateResource';
import { isSceneResource } from '@editor/utils';

export type Categories = Array<{ category: Category; title: string }>;

export default (teamId: string, projectId: number, categories: Categories, defaultCategory?: Category) => {
  const dispatch = useDispatch();
  const typeOfPlay = useSettings('typeOfPlay') || 0;

  const [category, setCategory] = useState<Category>(defaultCategory ?? categories[0].category);
  const {
    provider,
    public: publicData,
    project: projectData,
    private: privateData,
    shared: sharedData,
  } = useSelector(
    ({
      resource: {
        database: { [category]: data },
      },
    }: EditorState) => data
  );
  useEffect(() => {
    // 是否为场景化的项目资源
    // “是”的话不发送资源请求
    const isProjectSceneResource = provider === 'project' && isSceneResource(category);
    if (!isProjectSceneResource) {
      updateResource(teamId, projectId, provider, category).then(data => {
        dispatch(changeDatabase(category, provider, data as GroupList<IMaterial>));
      });
    }
  }, [dispatch, provider, category, projectId]);
  const onChangeProvider = usePersistCallback((provider: Provider) => {
    // 团队素材没有互动组件
    const components: (typeof category)[] = ['Animation', 'CustomScript'];
    if (provider === 'shared' && components.includes(category)) {
      const index = categories.findIndex(item => item.category === category);
      const item = categories[index + 1] || categories[index - 1];
      setCategory(item.category);
    }
    for (const { category } of categories) {
      if (provider !== 'shared' || !components.includes(category)) {
        dispatch(changeProvider(category, provider));
      }
    }
  });
  return {
    category,
    provider,
    publicData: filterData(typeOfPlay, category, publicData),
    projectData: filterData(typeOfPlay, category, projectData),
    privateData: filterData(typeOfPlay, category, privateData),
    sharedData: filterData(typeOfPlay, category, sharedData),
    setCategory,
    onChangeProvider,
  };
};

const filterData = (typeOfPlay: number, category: Category, data: GroupList<ResourceEntry>) => {
  if (typeOfPlay !== 3 || category !== 'Animation') {
    return data;
  }
  return data.filter(({ name }) => !name.includes('loading'));
};
