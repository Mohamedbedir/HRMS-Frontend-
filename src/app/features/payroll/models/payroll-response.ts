export interface PayrollResponse {
  id: number;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Generated' | 'Calculated' | 'Approved' | 'Paid' | 'Cancelled' | string;
  generatedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  employeeId: number;
  employeeName: string | null;
}

export interface PayrollDetailsResponse<T> {
  id: number;
  month: number;
  year: number;
  basicSalary: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'Draft' | 'Generated' | 'Calculated' | 'Approved' | 'Paid' | 'Cancelled' | string;
  generatedAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  employeeId: number;
  employeeName: string | null;
  items: T[] | null;
}

export interface PayrollItemResponse {
    name: string | null;
      type: 'BasicSalary'|'Overtime'|'Deduction'|'Bonus'|'Allowance'|'UnpaidLeave'|'Tax'|'Insurance'| string;
      amount: number;
      description: string | null;
}

export interface GeneratePayrollRequest {
  employeeId: number;
  month: number;
  year: number;
  bonus: number;
  deduction: number;
}

export interface ApprovePayrollRequest {
  payrollId: number;
}

export interface PayPayrollRequest {
  payrollId: number;
}

export interface CancelPayrollRequest {
  payrollId: number;
}
