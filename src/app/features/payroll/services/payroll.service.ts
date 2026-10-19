import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../shared/models/api-response";
import { ApprovePayrollRequest, CancelPayrollRequest, GeneratePayrollRequest, PayPayrollRequest, PayrollDetailsResponse, PayrollItemResponse, PayrollResponse } from "../models/payroll-response";

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
    private readonly http =inject(HttpClient);
    private readonly apiUrl= `${environment.apiUrl}/Payrolls`;

    getAllPayroll():Observable<ApiResponse<PayrollResponse[]>>{
        return this.http.get<ApiResponse<PayrollResponse[]>>(this.apiUrl);
    }

    getPayrollById(id:number):Observable<ApiResponse<PayrollDetailsResponse<PayrollItemResponse>>>{
        return this.http.get<ApiResponse<PayrollDetailsResponse<PayrollItemResponse>>>(`${this.apiUrl}/${id}`);
    }
      getPayrollByEmployee(employeeId:number):Observable<ApiResponse<PayrollResponse[]>>{
        return this.http.get<ApiResponse<PayrollResponse[]>>(`${this.apiUrl}/Employee/${employeeId}`);
    }

    GeneratePayroll(request:GeneratePayrollRequest):Observable<ApiResponse<string>>{
        return this.http.post<ApiResponse<string>>(`${this.apiUrl}/Calculate`,request);
    }

    approvePayroll(request:ApprovePayrollRequest):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Approve`,request);
    }
    PayPayroll(request:PayPayrollRequest):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Pay`,request);
    }
    CancelPayroll(request:CancelPayrollRequest):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Cancel`,request);
    }
    
    
}