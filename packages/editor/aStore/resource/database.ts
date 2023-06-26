import { Category } from './category';
export type Provider = 'public' | 'project' | 'private' | 'shared';
export type ResourceEntry = {
  id: number | string;
  name: string;
  previewUrl: number | string;
  userId?: string | number;
  cover?: any;
  extra?: Record<string, unknown>;
  type?: Record<string, unknown>;
};
export type GroupList<T> = Array<{
  name: string;
  categoryId?: string;
  tagId?: number;
  expandable: boolean;
  status: string;
  list: T[];
  total: number;
}>;
const DATABASE_ACTION = Symbol('ChangeDatabase');
const PROVIDER_ACTION = Symbol('ChangeProvider');
const initData = {
  provider: 'project' as Provider,
  public: [] as GroupList<ResourceEntry>,
  project: [] as GroupList<ResourceEntry>,
  private: [] as GroupList<ResourceEntry>,
  shared: [] as GroupList<ResourceEntry>,
};
const emptyDatabase: Record<Category, typeof initData> = {
  Effect: initData,
  Sprite: initData,
  Sound: initData,
  Video: initData,
  NativeLoadingVideo: initData,
  NativeVideo: initData,
  PVAlphaVideo: initData,
  VRVideo: initData,
  Animation: initData,
  PSD: initData,
  Lottie: initData,
  Particle: initData,
  FrameAnime: initData,
  DragonBones: initData,
  Spine: initData,
  Live2d: initData,
  CustomScript: initData,
  Font: initData,
  Material: initData,
  Cubemaps: initData,
  Model: initData,
  Animation3D: initData,
  Particle3D: initData,
  Texture2D: initData,
  AlphaVideo: initData,
};
export type Database = typeof emptyDatabase;
export const changeProvider = (category: Exclude<Category, '' | 'shape'>, provider: Provider) => ({
  type: PROVIDER_ACTION,
  category,
  provider,
});
export const changeDatabase = <C extends Exclude<Category, '' | 'shape'>, P extends Provider>(
  category: C,
  provider: P,
  data: Database[C][P]
) => ({
  type: DATABASE_ACTION,
  category,
  provider,
  data,
});
export default (
  database = emptyDatabase,
  action: ReturnType<typeof changeProvider | typeof changeDatabase>
): Database => {
  if (action.type === DATABASE_ACTION) {
    return {
      ...database,
      [action.category]: {
        ...database[action.category],
        [action.provider]: (action as ReturnType<typeof changeDatabase>).data,
      },
    };
  }
  if (action.type === PROVIDER_ACTION) {
    return {
      ...database,
      [action.category]: {
        ...database[action.category],
        provider: action.provider,
      },
    };
  }
  return database;
};
