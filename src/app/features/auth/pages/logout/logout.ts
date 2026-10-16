import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({ selector: 'app-logout', standalone: true, template: '<div class="container py-5 text-center"><div class="spinner-border text-primary" role="status"></div><p class="mt-3">Signing out...</p></div>' })
export class Logout {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  constructor() {
    const request = this.auth.logout();
    if (request) request.subscribe({ next: () => this.router.navigate(['/login']), error: () => { this.auth.clearSession(); this.router.navigate(['/login']); } });
    else this.router.navigate(['/login']);
  }
}
