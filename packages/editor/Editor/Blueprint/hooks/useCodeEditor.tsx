/**
 * 1. 选中画布中的图块时，可读可写
 * 2. 查看内置脚本代码，只读
 */

import create from 'zustand';
import { useBlueprint } from './core';
import { useScriptModel } from './useScriptModel';

/**
 * 不同的代码编辑模式
 * readOnly - 对于蓝图资源库的图块、以及公共互动组件的脚本，仅提供只读查看源码的能力
 * writeOnly - 对于画布中没有使用的脚本，仅提供编辑其源码的能力
 * selected - 对于画布中使用的脚本，提供编辑其源码的能力，同时能够根据代码生成对应的props
 */
type status =
  | {
      type: 'readOnly';
      name?: string;
      tsCode: string;
    }
  | { type: 'writeOnly'; url: number }
  | { type: 'selected' } // 画布中被选中的图块代码
  | { type: 'hidden' };
export const useCodeStatus = create<{
  status: status;
  setStatus: (status: status) => void;
}>(set => ({
  status: { type: 'hidden' },
  setStatus: status => {
    set({ status });
  },
}));
export function useCodeEditor(props: ReturnType<typeof useBlueprint>) {
  const { script, onChange } = useScriptModel(props);

  return {
    script,
    onChange,
  };
}
