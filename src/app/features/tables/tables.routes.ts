import { Routes } from '@angular/router';

export const tablesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tables').then((m) => m.TablesComponent),
    title: 'Roles',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'roles',
  },
];
