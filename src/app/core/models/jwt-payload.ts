export interface JwtPayload {
  nameid: string;
  email: string;
  EmployeeId?: string;

  role?: string | string[];
  roles?: string | string[];
  Role?: string | string[];
  Roles?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];

  exp: number;
  iat: number;
  iss: string;
  aud: string;
}