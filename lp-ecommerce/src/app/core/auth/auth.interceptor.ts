import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Attaches withCredentials to every API request so the httpOnly auth cookie
 * is included by the browser. On a 401 clears the in-memory session flag and
 * redirects to the admin login page (handles expired/invalid tokens mid-session).
 */
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
