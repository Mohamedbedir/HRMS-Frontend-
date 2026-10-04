import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthApiService } from '../../features/auth/services/auth-api.service';
import { TokenService } from './token.service';

import { LoginRequest } from '../../features/auth/models/login-request';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response';
import { LoginResponse } from '../../features/auth/models/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authApi = inject(AuthApiService);

  private readonly tokenService = inject(TokenService);

  private readonly router = inject(Router);

  login(request: LoginRequest) {
    return this.authApi.Login(request);
  }

  saveLoginTokens(accessToken: string,refreshToken: string ): void {
    this.tokenService.setTokens( accessToken,refreshToken);
  }

refreshToken(): Observable<ApiResponse<LoginResponse>> {
  const refreshToken = this.tokenService.getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token not found.');
  }

  return this.authApi.RefreshToken(refreshToken).pipe(
    tap(response => {
      if (response.succeeded && response.data) {
        this.tokenService.setTokens(response.data.accessToken, response.data.refreshToken);
      }
    })
  );
}
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) { 
        this.clearSession();
        return;
    }

    this.authApi.logout(refreshToken).subscribe({
        next: () => {
          this.clearSession();
        },

        error: () => {
          this.clearSession();
        }
      });
  }

  clearSession(): void {

    this.tokenService.clearTokens();

    this.router.navigate([
      '/auth/login'
    ]);
  }

  isAuthenticated(): boolean {

    const token = this.tokenService.getAccessToken();

    if (!token)
      return false;

    return !this.tokenService.isTokenExpired();
  }

  getRoles(): string[] {

    return this.tokenService.getRoles();
  }

  hasRole(role: string): boolean {

    return this.tokenService.hasRole(role);
  }
}