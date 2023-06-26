import produce from 'immer';
import { IWorkspaceState, IWebIdeState } from './types';

export const UPDATE_WORKSPACE = Symbol('UpdateWorkspace');

export const updateWorkspace = (workspace: Partial<IWorkspaceState>) =>
  ({ type: UPDATE_WORKSPACE, workspace } as const);

export default (state: IWebIdeState, action: any): IWebIdeState =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_WORKSPACE:
        draft.workspace = {
          ...draft.workspace,
          ...action.workspace,
        };
        break;
    }
  });
