import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { ApiResponse } from '../../../shared/models/api-response';
import { Observable } from 'rxjs';
import { LeaveTypeResponse } from '../pages/LeaveType-response';

@Injectable({
  providedIn: 'root',
})
export class LeaveTypeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/LeaveTypes`;

  // GET: All Leave Types
  getAll(): Observable<ApiResponse<LeaveTypeResponse[]>> {
    return this.http.get<ApiResponse<LeaveTypeResponse[]>>(this.apiUrl);
  }
}
