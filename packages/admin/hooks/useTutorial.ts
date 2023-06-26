import { ITutorial, tutorialService } from '@shared/api/tutorial';
import { useLoadingAction } from '@main/table';
import { QUERY_KEY } from '@main/table/constants';
import produce from 'immer';
import { useCallback } from 'react';
import { useQuery } from 'react-query';
import create from 'zustand';

// 全局唯一保存一份可用于修改的数据，当修改完成时需要通知所有 item 重新渲染
const useTutorial = create(() => [] as ITutorial[]);
const { getState, setState } = useTutorial;

export default () => {
  const tutorialList = useTutorial();
  const { startLoading, stopLoading } = useLoadingAction('正在获取教程');

  useQuery({
    staleTime: Infinity,
    queryKey: QUERY_KEY.TUTORIAL,
    queryFn: () => {
      startLoading();
      return tutorialService.getAllTutorials();
    },
    onSuccess: data => {
      setState(data, true);
    },
    onSettled: stopLoading,
  });

  return {
    tutorialList,
    getTutorial: useCallback((id: number) => getState().find(({ projectId }) => projectId === id), []),
    updateTutorial: (({ payload, type }) => {
      setState(
        produce((tutorialList: ITutorial[]) => {
          switch (type) {
            case 'modify':
              const findResult = tutorialList.find(({ projectId }) => projectId === payload.projectId);
              findResult ? (findResult.tutorialUrl = payload.tutorialUrl) : tutorialList.push(payload);
              return;
            case 'delete':
              return tutorialList.filter(item => item.projectId !== payload);
          }
        }),
        true
      );
    }) as {
      (data: { payload: ITutorial; type: 'modify' }): void;
      (data: { payload: ITutorial['projectId']; type: 'delete' }): void;
    },
  };
};
