import {  inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { DepartmentResponse } from '../models/department-response';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Departments`;

  GetAll(): Observable<ApiResponse<DepartmentResponse[]>> {
    return this.http.get<ApiResponse<DepartmentResponse[]>>(`${this.apiUrl}`);
  }
}