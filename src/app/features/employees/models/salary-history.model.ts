export interface SalaryHistoryModel {
  id: number;
  salary: number;
  startDate: string;
  endDate: string | null;
  reason: string;
  employeeId: number;
  employeeName: string;
}
