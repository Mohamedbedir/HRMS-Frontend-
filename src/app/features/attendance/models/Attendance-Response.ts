export interface AttendanceResponse {
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  lateMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
}

export interface CheckInRequest {
  notes: string;
}