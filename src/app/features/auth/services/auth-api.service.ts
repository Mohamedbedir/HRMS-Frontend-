import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { LoginRequest } from "../models/login-request";
import { Observable } from "rxjs";
import { LoginResponse } from "../models/login-response";
import { ApiResponse } from "../../../shared/models/api-response";

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {

    private readonly http=inject(HttpClient);
    private readonly apiUrl=`${environment.apiUrl}/Account`;

    Login(request:LoginRequest):Observable<ApiResponse<LoginResponse>>{
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/Login`,request)
    }

     RefreshToken( refreshToken: string ):Observable<ApiResponse<LoginResponse>>{
        return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/Refresh-Token`,{refreshToken})
    }

    logout( refreshToken: string ): Observable<any> {
    return this.http.post(`${this.apiUrl}/Logout`,{refreshToken});
  }
}