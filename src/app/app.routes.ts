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
  {
    path: 'my-documents',
    canActivate: [authGuard],
    title: 'My Documents',
    loadComponent: () =>
      import('./features/employee-documents/pages/documents-for-me/documents-for-me').then(
        (m) => m.DocumentsForMe,
      ),
  },
  {
    path: 'my-documents/:id',
    canActivate: [authGuard],
    title: 'Document Details',
    loadComponent: () =>
      import('./features/employee-documents/pages/document-details/document-details').then(
        (m) => m.DocumentDetails,
      ),
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
        title: 'Dashboard',
        data: { title: 'Dashboard' },
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then((m) => m.Dashboard),
      },

      {
        path: 'employees',
        title: 'Employees',
        loadComponent: () =>
          import('./features/employees/pages/employees/employees').then((m) => m.Employees),
      },

      {
        path: 'employees/:id/edit',
        title: 'Edit Employee',
        data: { title: 'Edit Employee' },
        loadComponent: () =>
          import('./features/employees/pages/employee-edit/employee-edit').then(
            (m) => m.EmployeeEdit,
          ),
      },

      {
        path: 'employees/:id',
        title: 'Employee Details',
        data: { title: 'Employee Details' },
        loadComponent: () =>
          import('./features/employees/pages/employee-view/employee-view').then(
            (m) => m.EmployeeView,
          ),
      },

      {
        path: 'departments',
        title: 'Departments',
        data: { title: 'Departments' },
        loadComponent: () =>
          import('./features/departments/pages/departments/departments').then((m) => m.Departments),
      },

      {
        path: 'departments/:id',
        title: 'Department Details',
        data: { title: 'Department Details' },
        loadComponent: () =>
          import('./features/departments/pages/department-details/department-details').then(
            (m) => m.DepartmentDetails,
          ),
      },

      {
        path: 'positions',
        title: 'Positions',
        data: { title: 'Positions' },
        loadComponent: () =>
          import('./features/positions/pages/positions/positions').then((m) => m.Positions),
      },
      {
        path: 'positions/:id',
        title: 'Position Details',
        data: { title: 'Position Details' },
        loadComponent: () =>
          import('./features/positions/pages/position-details/position-details').then(
            (m) => m.PositionDetails,
          ),
      },
      {
        path: 'performance-reviews',
        title: 'Performance Reviews',
        data: { title: 'Performance Reviews' },
        loadComponent: () =>
          import('./features/performance/pages/performance-reviews/performance-reviews').then(
            (m) => m.PerformanceReviews,
          ),
      },
      {
        path: 'performance-reviews/:id',
        title: 'Performance Review Details',
        data: { title: 'Performance Review Details' },
        loadComponent: () =>
          import(
            './features/performance/pages/performance-review-details/performance-review-details'
          ).then((m) => m.PerformanceReviewDetails),
      },
      {
        path: 'leave-requests',
        title: 'Leave Requests',
        data: { title: 'Leave Requests' },
        loadComponent: () =>
          import('./features/leave-requests/pages/leave-requests/leave-requests').then(
            (m) => m.LeaveRequests,
          ),
      },
      {
        path: 'leave-requests/:id',
        title: 'Leave Request Details',
        data: { title: 'Leave Request Details' },
        loadComponent: () =>
          import('./features/leave-requests/pages/leave-request-details/leave-request-details').then(
            (m) => m.LeaveRequestDetails,
          ),
      },
      {
        path: 'payroll',
        title: 'Payroll',
        data: { title: 'Payroll' },
        loadComponent: () =>
          import('./features/payroll/pages/payrolls/payrolls').then(
            (m) => m.Payrolls,
          ),
      },
      {
        path: 'payroll/:id',
        title: 'Payroll Details',
        data: { title: 'Payroll Details' },
        loadComponent: () =>
          import('./features/payroll/pages/payroll-details/payroll-details').then(
            (m) => m.PayrollDetails,
          ),
      },
      {
        path: 'employee-documents/:id',
        title: 'Document Details',
        data: { title: 'Document Details' },
        loadComponent: () =>
          import('./features/employee-documents/pages/document-details/document-details').then(
            (m) => m.DocumentDetails,
          ),
      },
      {
        path: 'employee-documents',
        title: 'Employee Documents',
        data: { title: 'Employee Documents' },
        loadComponent: () =>
          import('./features/employee-documents/pages/documents-for-me/documents-for-me').then(
            (m) => m.DocumentsForMe,
          ),
      },
      {
        path: 'applications',
        title: 'Applications',
        data: { title: 'Applications' },
        loadComponent: () =>
          import('./shared/pages/admin-feature-placeholder/admin-feature-placeholder').then(
            (m) => m.AdminFeaturePlaceholder,
          ),
      },
      {
        path: 'attendance',
        title: 'Attendance',
        data: { title: 'Attendance' },
        loadComponent: () =>
          import('./features/attendance/pages/attendance/attendance').then((m) => m.Attendance),
      },
      {
        path: 'candidates/:id',
        title: 'Candidate Details',
        data: { title: 'Candidate Details' },
        loadComponent: () =>
          import('./features/recruitment/candidates/pages/candidate-details/candidate-details').then(
            (m) => m.CandidateDetails,
          ),
      },
      {
        path: 'candidates',
        title: 'Candidates',
        data: { title: 'Candidates' },
        loadComponent: () =>
          import('./features/recruitment/candidates/pages/candidates/candidates').then(
            (m) => m.Candidates,
          ),
      },
      {
        path: 'job-postings/:id',
        title: 'Job Posting Details',
        data: { title: 'Job Posting Details' },
        loadComponent: () =>
          import('./features/recruitment/job-postings/pages/job-posting-details/job-posting-details').then(
            (m) => m.JobPostingDetails,
          ),
      },
      {
        path: 'job-postings',
        title: 'Job Postings',
        data: { title: 'Job Postings' },
        loadComponent: () =>
          import('./features/recruitment/job-postings/pages/job-postings/job-postings').then(
            (m) => m.JobPostings,
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
