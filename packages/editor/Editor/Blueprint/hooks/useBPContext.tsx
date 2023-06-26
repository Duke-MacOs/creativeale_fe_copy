import React, { useContext } from 'react';
import { useBlueprint } from './core/useBlueprint';

export const BlueprintContext = React.createContext<ReturnType<typeof useBlueprint> | null>(null);
/**
 * 提供Context
 * @returns
 */
export function useBPContext() {
  return useContext(BlueprintContext);
}
