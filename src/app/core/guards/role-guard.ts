import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { Role } from '../constants/roles';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Role[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRoles = authService.getRoles();

  const hasRequiredRole = requiredRoles.some(role =>
    userRoles.includes(role)
  );

  if (hasRequiredRole) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};