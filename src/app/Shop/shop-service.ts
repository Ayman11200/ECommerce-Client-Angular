import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPagination } from '../Shared/Models/IPagination';
import { environment } from '../../environments/environment';
import { ICategory } from '../Shared/Models/ICategory';
import { Observable } from 'rxjs';
import { ProductParams } from '../Shared/Models/ProductParams';
import { IProduct } from '../Shared/Models/IProduct';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  constructor(private httpClient: HttpClient) {}

  // Products
  getAllProducts(productParams: ProductParams): Observable<IPagination> {
    let param = new HttpParams();
    if (productParams.categoryId) {
      param = param.append('categoryId', productParams.categoryId.toString());
    }
    if (productParams.sort) {
      param = param.append('sort', productParams.sort);
    }
    if (productParams.search) {
      param = param.append('search', productParams.search);
    }
    param = param.append('pageNumber', productParams.pageNumber);
    param = param.append('pageSize', 2);

    return this.httpClient.get<IPagination>(`${environment.baseUrl}/Product`, { params: param });
  }

  // Categories
  getAllCategories(): Observable<ICategory[]> {
    return this.httpClient.get<ICategory[]>(`${environment.baseUrl}/Category/get-all`);
  }

  getProductById(id: number): Observable<IProduct> {
    return this.httpClient.get<IProduct>(`${environment.baseUrl}/Product/${id}`);
  }
}
