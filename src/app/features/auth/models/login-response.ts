export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;

  refreshToken: string;
  refreshTokenExpiresAt: string;
}
