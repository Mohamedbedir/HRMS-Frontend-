import { Routes } from '@angular/router';
import { Unauthorized } from './features/auth/pages/unauthorized/unauthorized';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Roles } from './core/constants/roles';

export const routes: Routes = [
  {
    path:'',
    redirectTo:'auth/login',
    pathMatch:'full'
  },
  {
    path:'auth',
    loadChildren:()=> import('./features/auth/auth.routes').then(a=>a.auth_routes)
  },

   // Admin
  {
  path: 'admin',

  canActivate: [authGuard,roleGuard],

  data: {
    roles: [Roles.Admin]
  },

  loadComponent: () =>
    import('./layouts/admin-layout/admin-layout')
      .then(m => m.AdminLayout),

  children: [

    { path: 'dashboard',
      loadComponent: () =>
        import('./features/dashboard/pages/dashboard/dashboard')
          .then(m => m.Dashboard)
    },

    {
      path: 'employees',
      loadComponent: () =>
        import('./features/employees/pages/employees/employees')
          .then(m => m.Employees)
    },

    {
      path: 'departments',
      loadComponent: () =>
        import('./features/departments/pages/departments/departments')
          .then(m => m.Departments)
    },

    {
      path: 'positions',
      loadComponent: () =>
        import('./features/positions/pages/positions/positions')
          .then(m => m.Positions)
    },

    {
      path: '',redirectTo: 'dashboard',pathMatch: 'full'
    }

  ]
},

  {
    path: 'unauthorized',
    component: Unauthorized
  },
  {
    path:'**',
    redirectTo:'auth/login'
  }
];
