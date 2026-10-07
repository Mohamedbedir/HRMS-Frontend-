import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/models/api-response';
import { DashboardStatistics } from '../models/dashboard-statistics';
import { RecentActivity } from '../models/recent-activity';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

    private readonly http=inject(HttpClient);
    private readonly apiUrl=`${environment.apiUrl}/Dashboard`;

    getDashboardStasts():Observable<ApiResponse<DashboardStatistics>>{
      return this.http.get<ApiResponse<DashboardStatistics>>(`${this.apiUrl}/Statistics`)
    }

    getRecentActivities(): Observable<ApiResponse<RecentActivity[]>> {
      return this.http.get<ApiResponse<RecentActivity[]>>(`${this.apiUrl}/RecentActivities`);
    }

}
