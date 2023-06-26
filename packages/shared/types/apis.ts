export type IPaginationReq = Pick<IPagination, 'page' | 'pageSize'>;

export interface IPagination {
  page: number;
  pageSize: number;
  total: number;
}
export interface IUploadFileRes {
  downloadUrl: string;
  previewUrl: string;
  ext: string;
  mime: string;
  cover?: string;
  zip?: string;
}
