import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import {  DashboardStatistics } from '../../models/dashboard-statistics';
import { DatePipe } from '@angular/common';

interface StatisticCard {
  title: string;
  value: string;
  icon: string;
  description: string;
  trend?: string;
  trendType?: 'success' | 'danger' | 'warning';
}

interface RecentActivity {
  title: string;
  description: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  
   private readonly dashboardService = inject(DashboardService);

  statistics = signal<StatisticCard[]>([]);
  statisticsError = signal<string | null>(null);

  recentActivities = signal<RecentActivity[]>([]);

  isLoading = signal(true);
  hasError = signal(false);

  quickActions = [
    {
      title: 'Add Employee',
      description: 'Create a new employee',
      icon: 'bi-person-plus-fill',
      route: '/admin/employees/create'
    },
    {
      title: 'Departments',
      description: 'Manage departments',
      icon: 'bi-diagram-3-fill',
      route: '/admin/departments'
    },
    {
      title: 'Attendance',
      description: 'View today attendance',
      icon: 'bi-calendar-check-fill',
      route: '/admin/attendance'
    },
    {
      title: 'Leave Requests',
      description: 'Review pending requests',
      icon: 'bi-calendar2-event-fill',
      route: '/admin/leave'
    }
  ];

  ngOnInit(): void {
    this.loadDashboard();
  }

   loadDashboard(): void {

  this.isLoading.set(true);
  this.hasError.set(false);

  this.dashboardService.getDashboardStasts().subscribe({
    next: response => {

      if (!response.succeeded || !response.data) {
        this.isLoading.set(false);
        this.hasError.set(true);
        return;
      }

      this.buildStatistics(response.data);

      this.loadRecentActivities();
    },

    error: error => {
      console.error('Failed to load dashboard.', error);

      this.isLoading.set(false);
      this.hasError.set(true);
    }
  });

 }
  private loadRecentActivities(): void {

  this.dashboardService.getRecentActivities().subscribe({
    next: response => {

      if (!response.succeeded || !response.data) {
        this.hasError.set(true);
        this.isLoading.set(false);
        return;
      }

      this.recentActivities.set(response.data);

      this.isLoading.set(false);
    },

    error: error => {

      console.error(
        'Failed to load recent activities.',
        error
      );

      this.isLoading.set(false);
      this.hasError.set(true);
    }
  });
}
 
  private buildStatistics(
    data: DashboardStatistics
  ): void {

    this.statistics.set([
      {
        title: 'Total Employees',
        value: data.totalEmployees.toString(),
        icon: 'bi-people-fill',
        description: 'Active employees'
      },
      {
        title: 'Present Today',
        value: data.presentToday.toString(),
        icon: 'bi-person-check-fill',
        description: 'Employees checked in'
      },
      {
        title: 'Pending Leaves',
        value: data.pendingLeaves.toString(),
        icon: 'bi-calendar2-event-fill',
        description: 'Requests awaiting review',
        trend: 'Needs attention',
        trendType: 'warning'
      },
      {
        title: 'Monthly Payroll',
        value: data.monthlyPayroll.toString(),
        icon: 'bi-cash-stack',
        description: 'Current month payroll'
      }
    ]);
  }
}