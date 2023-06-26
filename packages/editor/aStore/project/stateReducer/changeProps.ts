import { ActionType } from '@byted/riko';
import { IPropertyAction } from '..';
import { ICaseState } from '../types';

export default (state: ICaseState, action: IPropertyAction): ICaseState => {
  if (action.type === ActionType.Property && action.ids[0] === 0) {
    return {
      ...state,
      ...action.partial,
    };
  }
  return state;
};
