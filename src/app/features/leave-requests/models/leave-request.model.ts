
export interface LeaveRequest {
  id:number;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | string;
  approvedAt: string | null;
  createdAt: string;
  rejectionReason: string | null;
  employeeName: string;
  leaveType: string;
  approvedByName: string | null;
}

export interface CreateLeaveRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ApproveLeaveRequest {
  leaveRequestId: number;
}

export interface RejectLeaveRequest {
  leaveRequestId: number;
  rejectionReason: string;
}

export interface CancelLeaveRequest {
  leaveRequestId: number;
}
