import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { CreatePerformanceReviewRequest, PerformanceReviewResponse } from '../models/performance-review.model';

@Injectable({
  providedIn: 'root',
})
export class PerformanceReviewService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/PerformanceReviews`;

  getAll(): Observable<ApiResponse<PerformanceReviewResponse[]>> {
    return this.http.get<ApiResponse<PerformanceReviewResponse[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<PerformanceReviewResponse>> {
    return this.http.get<ApiResponse<PerformanceReviewResponse>>(`${this.apiUrl}/${id}`);
  }

  getByEmployee(employeeId: number): Observable<ApiResponse<PerformanceReviewResponse[]>> {
    return this.http.get<ApiResponse<PerformanceReviewResponse[]>>(`${this.apiUrl}/Employee/${employeeId}`);
  }

  create(request: CreatePerformanceReviewRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }
}
