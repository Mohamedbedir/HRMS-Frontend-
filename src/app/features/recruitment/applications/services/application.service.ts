import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../../shared/models/api-response";
import { ApplicationRequest, ApplicationResponse, EditApplicationRequest} from "../models/application-respose";

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/Applications`;

  getAllApplications():Observable<ApiResponse<ApplicationResponse[]>>{
    return this.http.get<ApiResponse<ApplicationResponse[]>>(`${this.apiUrl}`)
  }

  getApplicationById(id: number): Observable<ApiResponse<ApplicationResponse>> {
    return this.http.get<ApiResponse<ApplicationResponse>>(`${this.apiUrl}/${id}`);
  }

  createApplication(request: ApplicationRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, request);
  }

  EditApplication(request: EditApplicationRequest): Observable<ApiResponse<string>> {
   
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${request.id}`, request);
  }

  DeleteApplication(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}