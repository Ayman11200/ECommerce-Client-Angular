import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDeliveryMethod } from '../Shared/Models/IDeliveryMethod';
import { ICreateOrder, IOrder } from '../Shared/Models/IOrder';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private httpClient = inject(HttpClient);

  updateAddress(form: any) {
    return this.httpClient.put(`${environment.baseUrl}/Account/update-address`, form, {});
  }

  getAddress() {
    return this.httpClient.get(`${environment.baseUrl}/Account/get-address-for-user`);
  }

  getDeliveryMethod() {
    return this.httpClient.get<IDeliveryMethod[]>(`${environment.baseUrl}/Order/Get-delivery`);
  }

  createOrder(order: ICreateOrder) {
    return this.httpClient.post<IOrder>(`${environment.baseUrl}/Order/Create-order`, order);
  }
}
