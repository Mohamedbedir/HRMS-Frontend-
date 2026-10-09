export interface EmploymentHistoryModel {
  id: number;
  startDate: string;
  endDate: string | null;
  reason: string;
  employeeId: number;
  departmentId: number;
  positionId: number;
  employeeName: string;
  departmentName: string;
  positionTitle: string;
}
