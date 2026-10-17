import { Routes } from '@angular/router';
import { Unauthorized } from './features/auth/pages/unauthorized/unauthorized';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Roles } from './core/constants/roles';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((a) => a.auth_routes),
  },

  // Admin
  {
    path: 'admin',

    canActivate: [authGuard, roleGuard],

    data: {
      roles: [Roles.Admin],
    },

    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),

    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },

      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/pages/employees/employees').then((m) => m.Employees),
      },

      {
        path: 'employees/:id/edit',
        loadComponent: () =>
          import('./features/employees/pages/employee-edit/employee-edit').then(
            (m) => m.EmployeeEdit,
          ),
      },

      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/employees/pages/employee-view/employee-view').then(
            (m) => m.EmployeeView,
          ),
      },

      {
        path: 'departments',
        loadComponent: () =>
          import('./features/departments/pages/departments/departments').then((m) => m.Departments),
      },

      {
        path: 'departments/:id',
        loadComponent: () =>
          import('./features/departments/pages/department-details/department-details').then(
            (m) => m.DepartmentDetails,
          ),
      },

      {
        path: 'positions',
        loadComponent: () =>
          import('./features/positions/pages/positions/positions').then((m) => m.Positions),
      },
      {
        path: 'positions/:id',
        loadComponent: () =>
          import('./features/positions/pages/position-details/position-details').then(
            (m) => m.PositionDetails,
          ),
      },
      {
        path: 'performance-reviews',
        data: { title: 'Performance Reviews' },
        loadComponent: () =>
          import('./features/performance/pages/performance-reviews/performance-reviews').then(
            (m) => m.PerformanceReviews,
          ),
      },
      {
        path: 'performance-reviews/:id',
        data: { title: 'Performance Review Details' },
        loadComponent: () =>
          import(
            './features/performance/pages/performance-review-details/performance-review-details'
          ).then((m) => m.PerformanceReviewDetails),
      },
      {
        path: 'leave-requests',
        data: { title: 'Leave Requests' },
        loadComponent: () =>
          import('./features/leave-requests/pages/leave-requests/leave-requests').then(
            (m) => m.LeaveRequests,
          ),
      },
      {
        path: 'leave-requests/:id',
        data: { title: 'Leave Request Details' },
        loadComponent: () =>
          import('./features/leave-requests/pages/leave-request-details/leave-request-details').then(
            (m) => m.LeaveRequestDetails,
          ),
      },
      {
        path: 'payroll',
        data: { title: 'Payroll' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: 'employee-documents',
        data: { title: 'Employee Documents' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: 'applications',
        data: { title: 'Applications' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: 'attendance',
        data: { title: 'Attendance' },
        loadComponent: () =>
          import('./features/attendance/pages/attendance/attendance').then((m) => m.Attendance),
      },
      {
        path: 'candidates',
        data: { title: 'Candidates' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: 'job-postings',
        data: { title: 'Job Postings' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'unauthorized',
    component: Unauthorized,
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
