import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent),
    title: 'ReservaYa - Gestión de Reservas',
  },

  // RUTAS DE AUTH DE USUARIO
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },

  //RUTAS DE AUTH DE ADMINISTRADOR
  {
    path: 'admin/login',
    component: AdminLoginComponent,
  },

  // RUTAS DASHBOARD (UNIFICADO)
  {
    path: 'dashboard',
    component: DashboardComponent, // El Layout se carga solo una vez!
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
        title: 'Home',
      },

      // -- RUTAS PARA OWNER(1) / ADMIN(2) --
      {
        path: 'admins',
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
      },
      {
        path: 'roles',
        loadChildren: () => import('./features/role/role.routes').then((m) => m.rolesRoutes),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/user/user.routes').then((m) => m.userRoutes),
      },
      {
        path: 'admision',
        loadComponent: () =>
          import('./features/admision/admision').then((m) => m.AdmisionComponent),
        title: 'Admisión',
        loadChildren: () => import('./features/user/user.routes').then((m) => m.userRoutes),
      },

      // -- RUTAS GENERALES / OPERACIONALES --
      {
        path: 'shifts',
        loadChildren: () => import('./features/shift/shift.routes').then((m) => m.shiftRoutes),
      },
      {
        path: 'restaurants',
        loadChildren: () =>
          import('./features/restaurant/restaurant.routes').then((m) => m.restaurantRoutes),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employee/employee.routes').then((m) => m.employeeRoutes),
      },
      {
        path: 'tables',
        loadChildren: () => import('./features/tables/tables.routes').then((m) => m.tablesRoutes),
      },

      // CONFIGURACIÓN PROPIA
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.settingsRoutes),
      },

      // CATCH-ALL INTERNO DEL DASHBOARD
      { path: '**', redirectTo: 'home' },
    ],
  },

  // CATCH-ALL GLOBAL Y DESCONOCIDAS
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
