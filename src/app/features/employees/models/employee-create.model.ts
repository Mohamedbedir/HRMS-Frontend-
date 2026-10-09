export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  hireDate: string;
  terminationDate: string;
  salary: number;
  status: string;
  gender: string;
  departmentId: number | null;
  positionId: number | null;
  managerId: number | null;
}

export interface UpdateEmployeeRequest extends CreateEmployeeRequest {
  id: number;
}