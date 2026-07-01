import { Routes } from '@angular/router';

export const shiftRoutes: Routes = [

  {
    path: '',
    loadComponent: () => import('./shifts').then((m) => m.ShiftsComponent),
    title: 'Turnos',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'shifts',
  },
];
