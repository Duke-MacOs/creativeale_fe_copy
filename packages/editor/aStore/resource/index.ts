import { combineReducers } from 'redux';
import category from './category';
import database from './database';
export * from './category';
export * from './database';
export default combineReducers({ category, database });
