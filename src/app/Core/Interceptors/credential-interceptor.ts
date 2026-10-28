import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const credentialInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.baseUrl)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
