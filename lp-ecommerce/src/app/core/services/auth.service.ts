import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Tracks whether the admin is authenticated in memory only.
  // The actual credential is the httpOnly cookie managed by the browser.
  private readonly _authenticated = signal(false);

  readonly isAuthenticated = this._authenticated.asReadonly();

  /** Called once at app startup to restore session from an existing cookie. */
  checkSession(): Observable<void> {
    return this.http
      .get(`${environment.apiBaseUrl}/auth/me`, { withCredentials: true })
      .pipe(
        tap(() => this._authenticated.set(true)),
        catchError(() => of(null)),
        map(() => void 0),
      );
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ message: string }>(`${environment.apiBaseUrl}/auth/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(() => this._authenticated.set(true)),
        map(() => void 0),
      );
  }

  logout(): void {
    this.http
      .post(`${environment.apiBaseUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({ error: () => {} });
    this._authenticated.set(false);
  }
}
