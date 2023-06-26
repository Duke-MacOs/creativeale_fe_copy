import { INodeData, IScriptData } from '@byted/riko';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import reducer from '..';

export const getStore = () => createStore(reducer, composeWithDevTools(applyMiddleware(thunkMiddleware)));

export const createNode = (id: number, type: INodeData['type'], node?: Omit<INodeData, 'id' | 'type'>): INodeData => ({
  id,
  type,
  ...node,
});

export const createScript = (id: number, type: IScriptData['type'], props: IScriptData['props']): IScriptData => ({
  id,
  type,
  props,
});
