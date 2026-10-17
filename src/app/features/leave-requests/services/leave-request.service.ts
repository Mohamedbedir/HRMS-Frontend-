
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



import {
  LeaveRequest,
  CreateLeaveRequest,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  CancelLeaveRequest
} from '../models/leave-request.model';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/LeaveRequests`;

  // GET: All Leave Requests
  getAll(): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(this.apiUrl);
  }

  // GET: Leave Request By ID
  getById(id: number): Observable<ApiResponse<LeaveRequest>> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.apiUrl}/${id}`);
  }

  // GET: Leave Requests By Employee
  getByEmployee(employeeId: number): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.apiUrl}/Employee/${employeeId}`);
  }

  // POST: Create Leave Request
  create(request: CreateLeaveRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl,request);
  }

  // PUT: Approve Leave Request
  approve(request: ApproveLeaveRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Approve`,request);
  }

  // PUT: Reject Leave Request
  reject(request: RejectLeaveRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Reject`,request);
  }

  // PUT: Cancel Leave Request
  cancel(request: CancelLeaveRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Cancel`,request);
  }
}
