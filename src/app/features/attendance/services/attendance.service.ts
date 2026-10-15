import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { AttendanceResponse, CheckInRequest } from '../models/Attendance-Response';
import { ApiResponse } from '../../../shared/models/api-response';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/Attendances`;

  // POST: /Api/v1/Attendances/CheckIn
  checkIn(request: CheckInRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/CheckIn`,request);
  }

  // PUT: /Api/v1/Attendances/CheckOut
  checkOut(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/CheckOut`,null);
  }

  // GET: /Api/v1/Attendances
  // EmployeeId is optional because the backend can resolve it
  // from the current authenticated user.
  getMyAttendances(employeeId?: number): Observable<ApiResponse<AttendanceResponse[]>> {

    let params = new HttpParams();

    if (employeeId != null && employeeId > 0) {
      params = params.set('EmployeeId', employeeId);
    }

    return this.http.get<ApiResponse<AttendanceResponse[]>>(`${this.apiUrl}`,{ params });
  }

  // GET: /Api/v1/Attendances/ByDate
  getMyAttendancesByDate(fromDate?: string,toDate?: string,employeeId?: number):
   Observable<ApiResponse<AttendanceResponse[]>> {

    let params = new HttpParams();

    if (employeeId != null && employeeId > 0) {
      params = params.set('EmployeeId', employeeId);
    }

    if (fromDate) {
      params = params.set('FromDate', fromDate);
    }

    if (toDate) {
      params = params.set('ToDate', toDate);
    }

    return this.http.get<ApiResponse<AttendanceResponse[]>>(`${this.apiUrl}/ByDate`,{ params });
  }
}
