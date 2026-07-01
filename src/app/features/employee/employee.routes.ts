import { Routes } from '@angular/router';
import { EmployeesComponent } from './employees';

export const employeeRoutes: Routes = [

  {
    path: '',
    loadComponent: () => import('./employees').then((m) => m.EmployeesComponent),
    title: 'Empleados',
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'employees',
  },
];
