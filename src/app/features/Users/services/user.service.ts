import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { Observable } from "rxjs";
import { ApiResponse } from "../../../shared/models/api-response";
import { ChangePassword, EditRolesBody, LockUser, RegistNewUser, UnLockUser, UserResponse } from "../models/user-response";

export interface UserQuery {
//   pageNumber: number;
//   pageSize: number;
//   orderBy?: string;
//   filterByStatus?: string;
  searsh?: string;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {

    private readonly http=inject(HttpClient);
    private readonly apiUrl=`${environment.apiUrl}/Users`;  
    private readonly registApiUrl=`${environment.apiUrl}/Account/Register`;

    getAllUser(query: UserQuery = {}): Observable<ApiResponse<UserResponse[]>> {
        const search = query.searsh?.trim();
        if (!search) {
            return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/List`);
        }

        const params = new HttpParams().set('Searsh', search);
        return this.http.get<ApiResponse<UserResponse[]>>(`${this.apiUrl}/List`, { params });
    }

    registNewUser(user:RegistNewUser):Observable<ApiResponse<string>>{
        return this.http.post<ApiResponse<string>>(this.registApiUrl,user);
    }

    EditRolesForUser(body:EditRolesBody):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Edit-Roles`,body);
    }
    lockUser(body:LockUser):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Lock-User`,body);
    }
    UnlockUser(body:UnLockUser):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/UnLock-User`,body);
    }

     changePassword(body:ChangePassword):Observable<ApiResponse<string>>{
        return this.http.put<ApiResponse<string>>(`${this.apiUrl}/Change-Password`,body)
    }

    deleteUser(id:number):Observable<ApiResponse<string>>{
        return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`)
    }
}