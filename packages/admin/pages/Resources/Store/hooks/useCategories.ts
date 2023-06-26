import { getCategory } from '@shared/api/store';
import { useState } from 'react';

export interface ICategoryOptions {
  label: string;
  value: string;
}

const DefaultAll = { label: '全部', value: '0' };

export default () => {
  const [categories, setCategories] = useState<{ label: string; value: string }[]>([DefaultAll]);

  const getCategories = async (type: number) => {
    const data = await getCategory(type);
    setCategories([DefaultAll, ...data.map(d => ({ label: d.name, value: d.id }))]);
  };

  return {
    categories,
    getCategories,
  };
};
