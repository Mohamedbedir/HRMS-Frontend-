export interface EmployeeListItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  hireDate: string;
  terminationDate: string | null;
  status: string;
  departmentName: string;
  positionTitle: string;
  managerName: string;
}

