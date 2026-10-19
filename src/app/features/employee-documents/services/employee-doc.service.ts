import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../shared/models/api-response";
import { EditDocRequest, EmployeeDocumentResponse, UploadDocRequest } from "../models/Emp-Doc-Response";

@Injectable({
  providedIn: 'root'
})
export class EmployeeDocumentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/EmployeeDocuments`;

  getDocumentForEmployee(employeeId:number):Observable<ApiResponse<EmployeeDocumentResponse[]>>{
    return this.http.get<ApiResponse<EmployeeDocumentResponse[]>>(`${this.apiUrl}/Employee/${employeeId}`)
  }

  getDocumentById(id: number): Observable<ApiResponse<EmployeeDocumentResponse>> {
    return this.http.get<ApiResponse<EmployeeDocumentResponse>>(`${this.apiUrl}/${id}`);
  }

  UploadDocument(doc: UploadDocRequest): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('EmployeeId', doc.employeeId.toString());
    formData.append('DocumentType', doc.documentType);
    formData.append('File', doc.file);
    if (doc.expiryDate) {
      formData.append('ExpiryDate', doc.expiryDate);
    }

    return this.http.post<ApiResponse<string>>(this.apiUrl, formData);
  }

  EditDocument(doc: EditDocRequest): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('Id', doc.id.toString());
    formData.append('DocumentType', doc.documentType);
    if (doc.file) {
      formData.append('File', doc.file);
    }
    if (doc.expiryDate) {
      formData.append('ExpiryDate', doc.expiryDate);
    }

    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${doc.id}`, formData);
  }

  DeleteDocument(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
  }
}