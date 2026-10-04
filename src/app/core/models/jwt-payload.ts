export interface JwtPayload {
  nameid: string;
  email: string;
  EmployeeId?: string;

  role?: string | string[];

  exp: number;
  iat: number;
  iss: string;
  aud: string;
}