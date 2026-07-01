import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // If there's a token and role, allow access
    if (authService.roleValue) {
        return true;
    }

    // Otherwise, redirect to login page
    return router.createUrlTree(['/login']);
};
