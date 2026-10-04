import { Injectable } from '@angular/core';
import { JwtPayload } from '../models/jwt-payload';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly accessTokenKey = 'hrms_access_token';
  private readonly refreshTokenKey = 'hrms_refresh_token';

  setTokens(accessToken: string,refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey,accessToken);
    localStorage.setItem(this.refreshTokenKey,refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  decodeToken(): JwtPayload | null {

    const token = this.getAccessToken();

    if (!token)
      return null;

    try {

      const payload = token.split('.')[1];

      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

      return JSON.parse(decodedPayload) as JwtPayload;

    } catch {
      return null;
    }
  }

  getUserId(): number | null {

    const payload = this.decodeToken();

    if (!payload?.nameid)
      return null;

    return Number(payload.nameid);
  }

  getEmployeeId(): number | null {

    const payload = this.decodeToken();

    if (!payload?.EmployeeId)
      return null;

    return Number(payload.EmployeeId);
  }

  getRoles(): string[] {

    const payload = this.decodeToken();

    if (!payload?.role)
      return [];
    // check if role is arr or single value to return arr
    return Array.isArray(payload.role) ? payload.role: [payload.role];
  }

  hasRole(role: string): boolean {

    return this.getRoles().includes(role);
  }

  isTokenExpired(): boolean {

    const payload = this.decodeToken();

    if (!payload?.exp)
      return true;

    return Date.now() >= payload.exp * 1000;
  }
}