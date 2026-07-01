import { Routes } from '@angular/router';

export const adminRoutes: Routes = [

  {
    path: '',
    loadComponent: () => import('./admin').then((m) => m.AdminComponent),
    title: 'Admins',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'admin',
  },
];
