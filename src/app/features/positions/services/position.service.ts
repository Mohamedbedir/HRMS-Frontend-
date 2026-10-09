import {  inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/models/api-response';
import { HttpClient } from '@angular/common/http';
import { PositionResponse } from '../models/Position-response';



@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Positions`;

  GetAll(): Observable<ApiResponse<PositionResponse[]>> {
    return this.http.get<ApiResponse<PositionResponse[]>>(`${this.apiUrl}`);
  }
}