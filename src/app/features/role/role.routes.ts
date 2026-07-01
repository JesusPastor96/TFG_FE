
import { Routes } from '@angular/router';


export const rolesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./roles').then((m) => m.RolesComponent),
    title: 'Roles',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'roles',
  },
];
