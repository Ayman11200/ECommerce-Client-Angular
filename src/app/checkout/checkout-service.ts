import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { IDeliveryMethod } from '../Shared/Models/IDeliveryMethod';

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
}
