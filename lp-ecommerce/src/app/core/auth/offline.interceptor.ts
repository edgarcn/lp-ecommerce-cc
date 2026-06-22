import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isFileUpload = req.body instanceof FormData;
      if (err.status === 0 && !isFileUpload && req.url.startsWith(environment.apiBaseUrl)) {
        router.navigate(['/offline']);
      }
      return throwError(() => err);
    }),
  );
};
