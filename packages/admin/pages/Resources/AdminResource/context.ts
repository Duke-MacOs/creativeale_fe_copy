import React from 'react';
import { ICategory, IMaterial } from '@/types/library';
export interface ICategoryItem extends Omit<ICategory, 'id'> {
  id?: string;
  count: number;
  isNew?: boolean;
}
interface IMaterialContext {
  library: {
    loading: boolean;
    list: IMaterial[] | null;
    total: number;
    refreshList(isRandom?: boolean): Promise<any>;
  };
}

export const MaterialContext = React.createContext<IMaterialContext>({
  library: { loading: false, list: null, total: 0, refreshList: () => Promise.resolve() },
});
