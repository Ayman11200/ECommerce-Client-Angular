import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IOrder } from '../Shared/Models/IOrder';

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
}
