import { useState } from 'react';

export function useLoading() {
  const [loadingNodes, setLoadingNodes] = useState<string[]>([]);
  return [loadingNodes, setLoadingNodes] as const;
}
