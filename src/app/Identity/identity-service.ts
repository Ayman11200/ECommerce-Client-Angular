import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Service } from '@angular/core';
import { environment } from '../../environments/environment';
import { IActiveAccount } from '../Shared/Models/IActiveAccount';
import { IResetPassword } from '../Shared/Models/IResetPassword';

@Injectable({
  providedIn: 'root',
})
export class IdentityService {
  constructor(private httpClient: HttpClient) {}

  // Send a registration request to the
  register(form: any) {
    return this.httpClient.post(`${environment.baseUrl}/Account/Register`, form);
  }
  login(form: any) {
    return this.httpClient.post(`${environment.baseUrl}/Account/Login`, form, {});
  }
  active(params: IActiveAccount) {
    return this.httpClient.post(`${environment.baseUrl}/Account/Active-Account`, params);
  }
  forgotPassword(email: string) {
    let params = new HttpParams().set('email', email);
    return this.httpClient.post(`${environment.baseUrl}/Account/Send-email-forget-password`, null, {
      params,
    });
  }

  resetPassword(resetPasswordModel: IResetPassword) {
    return this.httpClient.post(
      `${environment.baseUrl}/Account/Reset-password`,
      resetPasswordModel,
    );
  }
}
