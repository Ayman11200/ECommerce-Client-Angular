import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

let refreshRequest$: ReturnType<typeof createRefreshRequest> | null = null;

export const credentialInterceptor: HttpInterceptorFn = (req, next) => {
  const refreshHttp = new HttpClient(inject(HttpBackend));
  const isApiRequest = req.url.startsWith(environment.baseUrl);
  const authReq = isApiRequest ? req.clone({ withCredentials: true }) : req;
  const isRefreshRequest = req.url.startsWith(
    `${environment.baseUrl}/Account/Refresh-Token`,
  );

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || !isApiRequest || isRefreshRequest) {
        return throwError(() => error);
      }

      if (!refreshRequest$) {
        refreshRequest$ = createRefreshRequest(refreshHttp).pipe(
          finalize(() => {
            refreshRequest$ = null;
          }),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      }

      return refreshRequest$.pipe(
        switchMap(() => next(authReq)),
        catchError(() => throwError(() => error)),
      );
    }),
  );
};

function createRefreshRequest(http: HttpClient) {
  return http.post<void>(`${environment.baseUrl}/Account/Refresh-Token`, null, {
    withCredentials: true,
  });
}
