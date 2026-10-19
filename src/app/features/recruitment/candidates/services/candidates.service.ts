import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../shared/models/api-response";
import { CandidateRequest, CandidateResponse, EditCandidateRequest } from "../models/candidates-response";

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/Candidates`;

  getAllCandidates():Observable<ApiResponse<CandidateResponse[]>>{
    return this.http.get<ApiResponse<CandidateResponse[]>>(`${this.apiUrl}`)
  }

  getCandidateById(id: number): Observable<ApiResponse<CandidateResponse>> {
    return this.http.get<ApiResponse<CandidateResponse>>(`${this.apiUrl}/${id}`);
  }

  createCandidate(request:CandidateRequest): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('FirstName', request.firstName);
    formData.append('LastName', request.lastName);
    formData.append('Email', request.email);
    formData.append('Phone', request.phone);
    formData.append('CV', request.cv);

    return this.http.post<ApiResponse<string>>(this.apiUrl, formData);
  }

  EditCandidate(request: EditCandidateRequest): Observable<ApiResponse<string>> {
      const formData = new FormData();
    formData.append('FirstName', request.firstName);
    formData.append('LastName', request.lastName);
    formData.append('Email', request.email);
    formData.append('Phone', request.phone);
    
    if (request.cv) {
      formData.append('CV', request.cv);
    }
   
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${request.id}`, formData);
  }

  DeleteCandidate(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}