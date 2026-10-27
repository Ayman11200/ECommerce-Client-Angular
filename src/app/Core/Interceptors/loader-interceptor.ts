import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingService } from '../Services/loading-service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  
  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => {loadingService.hide();}),
  );
};

