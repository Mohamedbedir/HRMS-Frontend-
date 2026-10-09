export interface EmployeeDetails {
  id: number;
  employeeNumber: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;
  address: string;

  birthDate: string | null;
  hireDate: string;
  terminationDate: string | null;

  salary: number;

  status: string;
  gender: string;

  departmentName: string;
  positionTitle: string;
  managerName: string;
  departmentId?: number;
  positionId?: number;
  managerId?: number | null;
}