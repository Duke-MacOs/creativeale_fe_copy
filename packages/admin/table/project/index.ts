export * from './util';
import { IPageParams } from '@main/routes/withPath';

export interface IFilterParams extends IPageParams {
  id: string;
  keyword: string;
  startDate: string;
  endDate: string;
}
