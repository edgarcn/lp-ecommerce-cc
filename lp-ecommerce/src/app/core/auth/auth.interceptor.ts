import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (req.url.startsWith(environment.apiBaseUrl)) {
    req = req.clone({ withCredentials: true });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isSessionCheck = req.url.endsWith('/auth/me');
      if (err.status === 401 && req.url.startsWith(environment.apiBaseUrl) && !isSessionCheck) {
        auth.logout();
        router.navigate(['/admin/login']);
      }
      return throwError(() => err);
    }),
  );
};
