import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { EditJobPostingRequest, JobPostingRequest, JobPostingResponse } from "../models/job-postings-response";
import { ApiResponse } from "../../../../shared/models/api-response";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class JobPostingService {
    
  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/JobPostings`;

  getAllJobPostings():Observable<ApiResponse<JobPostingResponse[]>>{
    return this.http.get<ApiResponse<JobPostingResponse[]>>(`${this.apiUrl}`)
  }

  getJobPostingById(id: number): Observable<ApiResponse<JobPostingResponse>> {
    return this.http.get<ApiResponse<JobPostingResponse>>(`${this.apiUrl}/${id}`);
  }

  createJobPosting(request: JobPostingRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  EditJobPosting(request: EditJobPostingRequest): Observable<ApiResponse<string>> {
   return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${request.id}`, request);
  }

  DeleteJobPosting(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}