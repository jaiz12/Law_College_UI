import { CanActivateFn, Router } from '@angular/router';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }


  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  router.navigate(['/']);

  return false;
};
