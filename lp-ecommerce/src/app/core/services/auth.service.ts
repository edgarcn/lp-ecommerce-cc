import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'velour.admin.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => !!this._token());

  token(): string | null {
    return this._token();
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ token: string }>(`${environment.apiBaseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.token);
          this._token.set(res.token);
        }),
        map(() => void 0),
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }
}
