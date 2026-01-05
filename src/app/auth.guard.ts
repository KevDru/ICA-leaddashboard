import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for bootstrap to complete
  await auth.bootstrap();

  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login') as UrlTree;
};
