import { fetchMaterialList, fetchMaterialTag, fetchUserMaterialList } from '@shared/api/library';
import { fetchUserCategories } from '@shared/api/category';
import { GroupList, ICustomScriptState, Provider } from '../../aStore';
import { ResourceMap, ResourceType } from '../upload';
import { IMaterial } from '@/types/library';
import { uniqBy } from 'lodash';
import { Effects } from '@editor/ResourceModal/hooks/useRequest';

export const fetchFontOptions = async (teamId: string, projectId: number) => {
  const [{ materialList }, { materialList: teams }, { materialList: list }] = await Promise.all([
    fetchResource(teamId, projectId, 'private', 1, 999, 'Font', 0),
    fetchResource(teamId, projectId, 'shared', 1, 999, 'Font', 0).catch(() => ({
      materialList: [],
    })),
    fetchResource(teamId, projectId, 'public', 1, 999, 'Font', 0).catch(() => ({
      materialList: [],
    })),
  ]);
  return uniqBy(
    [...materialList, ...teams, ...list].map(({ name, previewUrl }) => ({ label: name, value: previewUrl })),
    'value'
  );
};

export const fetchResource = (
  teamId: string,
  projectId: number,
  provider: Provider,
  page: number,
  pageSize: number,
  type: keyof typeof ResourceType,
  tagId: number,
  keyword?: string,
  categoryId?: string
) => {
  const tagIds = tagId ? String(tagId) : undefined;
  if (provider === 'public') {
    return fetchMaterialList({
      page,
      pageSize,
      sort: 'updated_at desc',
      types: String(ResourceType[type]),
      keyword,
      tagIds,
      onPlatform: true,
      statuses: '1',
    });
  }
  if (provider === 'project') {
    return fetchUserMaterialList({
      projectId,
      page,
      pageSize,
      types: ResourceType[type] === ResourceType.Effect ? Effects.join(',') : ResourceType[type],
      keyword,
      categoryId,
      sort: 'created_at desc',
    } as any);
  }
  return fetchUserMaterialList({
    page,
    pageSize,
    types: ResourceType[type],
    keyword,
    teamId,
    sort: 'created_at desc',
    categoryId,
  } as any);
};

export default (
  teamId: string,
  projectId: number,
  provider: Provider,
  category: keyof typeof ResourceType
): Promise<GroupList<IMaterial | ICustomScriptState>> => {
  if (provider === 'private' && !['Animation', 'CustomScript'].includes(category)) {
    return fetchUserCategories()
      .then(({ categories }) => {
        return Promise.all(
          categories
            .filter(cat => cat.id !== '1' && cat.id !== '0')
            .map(cat =>
              fetchResource(teamId, projectId, provider, 1, 6, category, 0, undefined, cat.id).then(
                ({ materialList, pagination }) => ({
                  name: cat.name,
                  list: materialList,
                  total: pagination.total,
                  categoryId: cat.id,
                  expandable: true,
                  status: 'loaded',
                })
              )
            )
        );
      })
      .then(groups => {
        return groups.filter(group => group.total > 0 || group.name === '未分类');
      });
  } else if (provider === 'public' && Object.keys(ResourceMap).includes(category)) {
    return fetchMaterialTag({
      category: 9,
      pageSize: 999,
      origin: 1,
      parentName: ResourceMap[category] as string,
    }).then(async ({ tags }) => {
      const result = [] as any;
      await Promise.all(
        tags.concat({ id: '-1', name: '其他' }).map((tag: any, index: number) => {
          return fetchResource(teamId, projectId, provider, 1, provider !== 'public' ? 999 : 6, category, tag.id).then(
            ({ materialList, pagination }) => {
              if (pagination.total > 0) {
                result[index] = {
                  name: tag.name,
                  list: materialList || [],
                  total: pagination.total,
                  tagId: tag.id,
                  expandable: provider === 'public',
                  status: 'loaded',
                  parentName: tag.parentName,
                };
              }
            }
          );
        })
      );
      if (result.flat().length) {
        return result.flat();
      } else {
        return [
          {
            name: '全部',
            list: [],
            total: 0,
            tagId: 0,
          },
        ];
      }
    });
  }
  return fetchResource(teamId, projectId, provider, 1, provider === 'project' ? 999 : 6, category, 0).then(
    async ({ materialList, pagination }) =>
      [
        {
          name: '未分类',
          list: materialList,
          total: pagination.total,
          tagId: 0,
        },
      ].map(item => ({ ...item, expandable: provider !== 'project', status: 'loaded' }))
  );
};
