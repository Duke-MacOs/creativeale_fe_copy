import { ICaseState, IMaterialState } from '../types';

export const UPDATE_MATERIAL = Symbol('UpdateMaterial');

// action 创建函数
export const updateMaterial = (id: number | undefined, material: IMaterialState['material'], orderId?: number) => {
  return { type: UPDATE_MATERIAL, id, orderId, material };
};

// action 处理函数
export default function reducer(
  state: ICaseState,
  { type, id, orderId, material }: ReturnType<typeof updateMaterial>
): ICaseState {
  if (type === UPDATE_MATERIAL) {
    const index = state.materials.findIndex(item => (orderId ? item.orderId == orderId : item.id === id));
    const newMaterials = state.materials.slice();
    if (index >= 0) {
      const target = state.materials.splice(index, 1)[0];
      newMaterials.splice(index, 1, { ...target, material });
      if (state.type === 'Project') {
        return {
          ...state,
          materials: newMaterials,
        };
      } else {
        return {
          ...state,
          materials: newMaterials,
          editor: {
            ...state.editor,
            prevState: { ...state.editor.prevState, materials: newMaterials } as any,
          },
        };
      }
    } else {
      return state;
    }
  }
  return state;
}
