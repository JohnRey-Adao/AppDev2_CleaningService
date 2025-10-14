import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data?.['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Redirect to appropriate dashboard based on user role
  const user = authService.getCurrentUser();
  if (user) {
    if (user.roles.includes('ROLE_SUPER_ADMIN')) {
      router.navigate(['/super-admin-dashboard']);
    } else if (user.roles.includes('ROLE_ADMIN')) {
      router.navigate(['/admin-dashboard']);
    } else if (user.roles.includes('ROLE_CLEANER')) {
      router.navigate(['/cleaner-dashboard']);
    } else if (user.roles.includes('ROLE_CUSTOMER')) {
      router.navigate(['/customer-dashboard']);
    }
  } else {
    router.navigate(['/login']);
  }

  return false;
};
