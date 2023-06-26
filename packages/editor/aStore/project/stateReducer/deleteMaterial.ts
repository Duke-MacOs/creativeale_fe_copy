import { ICaseState } from '../types';

export const Delete_MATERIAL = Symbol('DeleteMaterial');

// action 创建函数
export const deleteMaterial = (id?: number) => {
  return { type: Delete_MATERIAL, id };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id: deleteId }: ReturnType<typeof deleteMaterial>
): ICaseState {
  if (type === Delete_MATERIAL) {
    if (state.type === 'Project') {
      const materials = deleteId ? state.materials.filter(({ id }) => id !== deleteId) : [];
      return {
        ...state,
        materials,
      };
    }
  }
  return state;
}
