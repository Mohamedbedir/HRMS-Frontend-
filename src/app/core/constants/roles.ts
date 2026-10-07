export const Roles = {
  Admin: 'Admin',
  HR: 'HR',
  Manager: 'Manager',
  Employee: 'Employee',
  Recruiter: 'Recruiter'
} as const;

export type Role = typeof Roles[keyof typeof Roles];