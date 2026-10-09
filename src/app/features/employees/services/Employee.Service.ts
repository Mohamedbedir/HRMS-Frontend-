import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { EmployeeListItem } from '../models/employee-list.model';
import { PaginationResponse } from '../models/Pagination-Response';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '../models/employee-create.model';
import { ApiResponse } from '../../../shared/models/api-response';
import { EmployeeDetails } from '../models/employeedetails';
import {  EmploymentHistoryModel } from '../models/employment-history.model';
import {  SalaryHistoryModel } from '../models/salary-history.model';

export interface PagentedEmployeeQuery {
  pageNumber: number;
  pageSize: number;
  orderBy?: string;
  filterByStatus?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Employees`;

  GetAll(): Observable<ApiResponse<EmployeeListItem[]>> {
    return this.http.get<ApiResponse<EmployeeListItem[]>>(`${this.apiUrl}`);
  }

  getEmployeeById(id: number): Observable<ApiResponse<EmployeeDetails>> {
  return this.http.get<ApiResponse<EmployeeDetails>>(`${this.apiUrl}/${id}`);
  }

  getEmploymentHistory(employeeId: number): Observable<ApiResponse<EmploymentHistoryModel[]>> {
    return this.http.get<ApiResponse<EmploymentHistoryModel[]>>(
      `${this.apiUrl}/EmploymentHistory/${employeeId}`
    );
  }

  getSalaryHistory(employeeId: number): Observable<ApiResponse<SalaryHistoryModel[]>> {
    return this.http.get<ApiResponse<SalaryHistoryModel[]>>(
      `${this.apiUrl}/SalaryHistory/${employeeId}`
    );
  }

  getEmployees(query: PagentedEmployeeQuery): Observable<PaginationResponse<EmployeeListItem[]>> {

    let params = new HttpParams()
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize);

    if (query.orderBy) {
      params = params.set('OrderBy', query.orderBy);
    }

    if (query.filterByStatus) {
      params = params.set('FilterByStatus', query.filterByStatus);
    }

    if (query.search) {
      params = params.set('Search', query.search);
    }

    return this.http.get<PaginationResponse<EmployeeListItem[]>>(`${this.apiUrl}/Paginated`,{ params });
  }


  createEmployee(employee: CreateEmployeeRequest): Observable<ApiResponse<any>> {

    return this.http.post<ApiResponse<any>>(this.apiUrl, this.toFormData(employee));
  }

  updateEmployee(employee: UpdateEmployeeRequest): Observable<ApiResponse<unknown>> {
    return this.http.put<ApiResponse<unknown>>(
      `${this.apiUrl}/${employee.id}`,
      this.toFormData(employee, employee.id)
    );
  }

  private toFormData(
    employee: CreateEmployeeRequest,
    id?: number
  ): FormData {
    const formData = new FormData();

    if (id !== undefined) {
      formData.append('Id', id.toString());
    }

    formData.append('FirstName', employee.firstName);
    formData.append('LastName', employee.lastName);
    formData.append('Email', employee.email);
    formData.append('Phone', employee.phone);
    formData.append('Address', employee.address);
    formData.append('BirthDate', employee.birthDate);
    formData.append('HireDate', employee.hireDate);
    formData.append('TerminationDate', employee.terminationDate);
    formData.append('Salary', employee.salary.toString());
    formData.append('Status', employee.status);
    formData.append('Gender', employee.gender);

    if (employee.departmentId !== null) {
      formData.append('DepartmentId', employee.departmentId.toString());
    }

    if (employee.positionId !== null) {
      formData.append('PositionId', employee.positionId.toString());
    }

    if (employee.managerId !== null) {
      formData.append('ManagerId', employee.managerId.toString());
    }

    return formData;
  }
}