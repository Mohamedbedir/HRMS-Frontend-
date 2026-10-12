import {  inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { HttpClient } from '@angular/common/http';
import { PositionResponse } from '../models/Position-response';
import { PositionCreateRequest, PositionUpdateRequest } from '../models/position-request';



@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Positions`;

  GetAll(): Observable<ApiResponse<PositionResponse[]>> {
    return this.http.get<ApiResponse<PositionResponse[]>>(`${this.apiUrl}`);
  }

    GetpositionByid(id:number): Observable<ApiResponse<PositionResponse>> {
      return this.http.get<ApiResponse<PositionResponse>>(`${this.apiUrl}/${id}`);
    }
  
    Createposition(model:PositionCreateRequest):Observable<ApiResponse<string>>{
      return this.http.post<ApiResponse<string>>(`${this.apiUrl}`, model)
    }
  
    Updateposition(id: number, model: PositionUpdateRequest): Observable<ApiResponse<string>> {
      return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${id}`, model);
    }
  
    Deletepostion(id:number): Observable<ApiResponse<string>> {
      return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`);
    }
}