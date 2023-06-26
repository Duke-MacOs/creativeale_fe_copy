import {
  IMaterial,
  IUserMaterial,
  IFetchMaterialList,
  IFetchUserMaterialList,
  IPostMaterialParams,
} from '@/types/library';
import { IPagination, IUploadFileRes } from '@/types/apis';
import { http } from './axios';
import { parseJson } from '@shared/utils';
import { request, gql } from 'graphql-request';

// 获取素材列表
export const fetchMaterialList: IFetchMaterialList = async params => {
  const { data } = await http.get('material/list', { params });
  const {
    data: { list: materialList = [], tagList = [], ...pagination },
  } = data;
  return {
    materialList: materialList.map((item: IMaterial) => ({
      ...item,
      extra: parseJson(item.extra),
    })),
    tagList,
    pagination: pagination as IPagination,
  };
};
// 批量删除
export const BatchDeleteMaterial = async (ids: IMaterial['id'][]) => {
  const { data } = await http.post('material/delete', { ids });
  return data.data;
};

// 批量重命名
export const renameMaterial = async (names: Array<{ id: IMaterial['id']; name: string }>) => {
  const { data } = await http.post('material/rename', { renames: names });
  return data.data;
};

// 批量打标签（平台标签）
export const batchTag = async (batch: { id: number; tagIds: string[]; onPlatform: boolean }[]) => {
  const { data } = await http.post('material/batchTag', { batch });
  return data;
};

// 批量修改标签
export const updateTagOfMaterial = async (ids: IMaterial['id'][], platformTags: string[], cloudTags: string[]) => {
  const { data } = await http.post('material/updateTag', { ids, platformTags, cloudTags });
  return data;
};
// 审核素材
export const reviewMaterial = async (
  params: Partial<{ ids: IMaterial['id'][]; status: number; onPlatform: boolean }>
) => {
  const { data } = await http.post('material/audit', params);
  return data.data;
};

// 素材使用历史创建
export const createUseHistory = async (id: IMaterial['id']) => {
  const { data } = await http.post('material/createUseHistory', { id });
  return data.data;
};

// 获取最近使用素材
export const getUseHistory = async (params: { types: number; keyword?: string }) => {
  const { data } = await http.get('material/getUseHistory', {
    params,
  });
  return data.data;
};

// 获取素材类别
export const fetchMaterialCategory = async () => {
  const { data } = await http.get('category/all');
  return data.data;
};
// 获取某类素材标签
export const fetchMaterialTag = async (params: {
  category: number;
  pageSize: number;
  origin: number;
  parentName: string;
}) => {
  const { data } = await http.get('tag/list', { params });
  return data.data;
};
// 获取所有素材标签
export const fetchAllMaterialTag = async (params: { onPlatform: boolean }) => {
  const { data } = await http.get('tag/list', { params });
  return data.data;
};
// 创建素材
export const createMaterial = async (params: IPostMaterialParams): Promise<{ id: IMaterial['id'] }> => {
  const { file, ...body } = params;
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }
  const { data } = await http.post('material/create', formData);
  return data;
};

//编辑素材
export const updateMaterial = async (
  params: IPostMaterialParams,
  id: IMaterial['id']
): Promise<{ id: IMaterial['id'] }> => {
  const body = { ...params, id };
  const { data } = await http.post('material/update', body);
  return data;
};

// 通过 ID 获取指定素材信息
export const getMaterialById = async (id: IMaterial['id'], isRandom?: boolean): Promise<IMaterial> => {
  if (isRandom) {
    const { data } = await http.get(`material/detail?id=${id}&random=${Math.floor(Math.random() * 10000)}`);
    return data.data;
  } else {
    const { data } = await http.get(`material/detail?id=${id}`);
    return data.data;
  }
};

// 通过 ID 删除素材
export const deleteMaterial = async (id: IMaterial['id']) => {
  const { data } = await http.get(`material/delete?id=${id}`);
  return data.data;
};

// 素材上传
export const materialUpload = async (file: File | Blob, type: number): Promise<IUploadFileRes> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', String(type));
  const {
    data: { data },
  } = await http.post('upload/material', formData);
  return data;
};

// 通过resourceId查询组件资源信息
export const fetchCompResource = async (resourceId: string, type: number) => {
  const { data } = await http.get('user/adv_resource/detailByResourceId', {
    params: {
      resourceId,
      type, // Component Type
    },
  });
  return data.data;
};

// 个人素材列表
export const fetchUserMaterialList: IFetchUserMaterialList = async params => {
  const { data } = await http.get('user/resource/list', { params });
  const {
    data: { list: materialList = [], tagList = [], ...pagination },
  } = data;
  return {
    materialList: materialList.map((item: IUserMaterial) => ({
      ...item,
      extra: parseJson(item.extra),
    })),
    tagList,
    pagination: pagination as IPagination,
  };
};
// 个人素材编辑
export const updateUserMaterial = async (id: IMaterial['id'], name: string) => {
  const { data } = await http.post('user/resource/update', { id, name });
  return data.data;
};
// 通过 IDs 删除个人素材
export const deleteUserMaterial = async (ids: IMaterial['id'][], teamId?: string) => {
  await http.post('user/resource/delete', { ids, teamId });
};
// 变更素材分类
export const updateCategoryOfUserMaterial = async (ids: IMaterial['id'][], categoryIds: string[]) => {
  const { data } = await http.post('user/resource/updateCategory', { ids, categoryIds });
  return data.data;
};
// 从分类中移除素材
export const removeUserMaterialFromCategory = async (ids: IMaterial['id'][], categoryIds: string[]) => {
  const { data } = await http.post('user/resource/removeCategory', { ids, categoryIds });
  return data.data;
};
// 从回收站中还原素材
export const restoreUserMaterial = async (ids: IMaterial['id'][]) => {
  const { data } = await http.post('user/resource/restore', { ids });
  return data.data;
};
// 从回收站中清理素材
export const cleanUserMaterial = async (ids: IMaterial['id'][]) => {
  const { data } = await http.post('user/resource/cleanTrashed', { ids });
  return data.data;
};

// 获取素材详情
export const fetchUserMaterialDetail = async (id: IMaterial['id']) => {
  const { data } = await http.get('user/resource/detail', { params: { id } });
  return data.data;
};
// 批量重命名
export const renameUserMaterial = async (names: Array<{ id: IMaterial['id']; name: string }>, teamId?: string) => {
  const { data } = await http.post('user/resource/rename', { renames: names, teamId });
  return data.data;
};

// 批量从url转化为素材
export const createMaterialByUrls = async (
  creates: Record<
    string,
    Partial<Pick<IMaterial, 'name' | 'cover' | 'description' | 'projectId'>> & {
      type: number;
      url: string;
      isTeam?: boolean;
      distinct?: boolean; //资源是否去重
    }
  >,
  uploadOnly = false
) => {
  const { data } = await http.post('user/resource/batchCreateByUrls', { creates, uploadOnly });
  return data.data;
};

// 获取粒子素材
export const fetchParticles = async (params: any) => {
  let queryData = `page: ${params.page},
    pageSize: ${params.pageSize},
    sort: "id",
    isPrivate: "${params.isPrivate}",
    title: "${params.title}"`;

  if (params.is_mark === 'false') {
    queryData = queryData + `is_mark:false,`;
  } else if (params.is_mark === 'true') {
    queryData = queryData + `is_mark:true,`;
  }
  if (params.is_done === 'false') {
    queryData = queryData + `is_done:false,`;
  } else if (params.is_done === 'true') {
    queryData = queryData + `is_done:true,`;
  }
  if (params.on_platform === 'false') {
    queryData = queryData + `on_platform:false,`;
  } else if (params.on_platform === 'true') {
    queryData = queryData + `on_platform:true,`;
  }
  const query = gql`
  {
      getEffecthubItems(${queryData}) {
        totalCount
        list{
          id
          title
   			  tos_cover
          tos_preview_url
          tos_url
          is_mark
          is_private
          is_done
          clab_id
          on_platform
        }
      }
    }
  `;

  const particles = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.getEffecthubItems);

  return particles;
};
// 更新粒子
export const updateParticle = async (params: any) => {
  let queryData = `id:"${params.id}"`;
  if (params.is_mark !== undefined) {
    queryData = queryData + `is_mark:${params.is_mark}`;
  }
  if (params.is_done !== undefined) {
    queryData = queryData + `is_done:${params.is_done}`;
  }
  if (params.title) {
    queryData = queryData + `title:"${params.title}"`;
  }
  if (params.tos_cover) {
    queryData = queryData + `tos_cover:"${params.tos_cover}"`;
  }
  const query = gql`
  mutation{
    updateEffecthubItem( ${queryData})
    }
  `;
  const isMark = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.updateEffecthubItem);
  return isMark;
};

// 上下架粒子
export const syncCreate = async (params: any) => {
  const queryData = `id:"${params.id}",opt:${params.opt}`;
  const query = gql`
  mutation{
    syncCreate(${queryData})
    }
  `;
  const data = await request(`${location.origin}/api/graphql`, query).then((data: any) => data.syncCreate);
  return data;
};
// 下载压缩好的视频
export const downloadVideo = async (vid: string) => {
  const { data } = await http.get(`vcloud/getVideoPlayInfo`, { params: { vid } });
  return data.data;
};

export const serverSideBundler = async <T extends { name: string; content: string }>(entry: T, deps: T[]) => {
  const { data } = await http.post(`faas/bundler`, { entry, deps });
  return data.data;
};

// 复制资源为项目资源
export const saveAsProject = async (projectId: number, ids: string[]) => {
  const { data } = await http.post('user/material/saveAsProject', { projectId, ids });
  return data.data;
};
