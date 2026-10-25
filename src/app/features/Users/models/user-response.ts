export interface UserResponse {
  id: number;
  employeeId: number;
  userName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  roles:string[];
  lockoutEnabled: boolean;
  lockoutEnd: string | null;
}

export interface ChangePassword {
  id: number;
  newPassword: string;
  confirmPassword: string;
}

export interface RegistNewUser {
  employeeId: number;
  email: string;
  password: string;
  role: string;
}

export interface EditRolesBody{
  userId: number,
  roles: string[]
}

export interface LockUser {
  id: number;
}

export interface UnLockUser {
  id: number;
}
