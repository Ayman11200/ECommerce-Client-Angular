import { IProduct } from './IProduct';

export interface IPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  data: IProduct[];
}
