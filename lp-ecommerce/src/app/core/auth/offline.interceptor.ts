import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * When an API request can't reach the server (status 0 = connection refused,
 * DNS failure, CORS/preflight error), redirect to the offline page so the
 * customer sees a clear "service is offline" message instead of a broken screen.
 */
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
