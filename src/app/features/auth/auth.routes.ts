import { Routes } from '@angular/router';

export const auth_routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title:'Login'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((r) => r.Register),
    title:'Register'
  },
];
