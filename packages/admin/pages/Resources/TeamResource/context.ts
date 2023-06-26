import React from 'react';
import { ICategoryItem } from './Categories/useCategory';
import { IUserMaterial } from '@/types/library';

interface IUserMaterialContext {
  category: {
    list: ICategoryItem[] | null;
    activeCategoryId: string | null;
    refreshList(): Promise<any>;
    addCategory(): void;
    cancelAddCategory(): void;
  };
  library: {
    loading: boolean;
    list: IUserMaterial[] | null;
    total: number;
    refreshList(): Promise<any>;
  };
}

export const UserMaterialContext = React.createContext<IUserMaterialContext>({
  category: {
    list: null,
    activeCategoryId: null,
    refreshList: () => Promise.resolve(),
    addCategory: () => undefined,
    cancelAddCategory: () => undefined,
  },
  library: { loading: false, list: null, total: 0, refreshList: () => Promise.resolve() },
});
