import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IOrder } from '../Shared/Models/IOrder';
import { IRating } from '../Shared/Models/IRating';

@Injectable({
  providedIn: 'root',
})
export class OrderSrevice {
  private httpClient = inject(HttpClient);

  getOrdersForUser() {
    return this.httpClient.get<IOrder[]>(`${environment.baseUrl}/Order/Get-Orders-for-User`);
  }

  getOrderById(id: number) {
    return this.httpClient.get<IOrder>(`${environment.baseUrl}/Order/Get-order-by-id/${id}`);
  }

  addRating(ratingDto: IRating) {
    return this.httpClient.post(`${environment.baseUrl}/Ratings/add-rating`, ratingDto);
  }
}
