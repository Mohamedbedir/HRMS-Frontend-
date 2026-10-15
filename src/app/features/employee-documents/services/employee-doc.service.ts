import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../shared/models/api-response";
import { EmployeeDocumentResponse } from "../models/Emp-Doc-Response";

@Injectable({
  providedIn: 'root'
})
export class EmployeeDocumentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/EmployeeDocuments`;

  getDocumentForEmployee(employeeId:number):Observable<ApiResponse<EmployeeDocumentResponse[]>>{
    return this.http.get<ApiResponse<EmployeeDocumentResponse[]>>(`${this.apiUrl}/Employee/${employeeId}`)
  }
}