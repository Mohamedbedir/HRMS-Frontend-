import {  inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { DepartmentResponse } from '../models/department-response';
import { HttpClient } from '@angular/common/http';
import { DepartmentCreateRequest, DepartmentUpdateRequest } from '../models/department-request';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Departments`;

  GetAll(): Observable<ApiResponse<DepartmentResponse[]>> {
    return this.http.get<ApiResponse<DepartmentResponse[]>>(`${this.apiUrl}`);
  }

  GetdepartmentByid(id:number): Observable<ApiResponse<DepartmentResponse>> {
    return this.http.get<ApiResponse<DepartmentResponse>>(`${this.apiUrl}/${id}`);
  }

  Createdepartment(model:DepartmentCreateRequest):Observable<ApiResponse<string>>{
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}`, model)
  }

  UpdateDepartment(id: number, model: DepartmentUpdateRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}`, model);
  }

  Deletedepartment(id:number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}