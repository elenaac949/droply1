import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard que impide acceder a rutas públicas (como login o registro)
 * si el usuario ya ha iniciado sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Evita que un usuario autenticado acceda a rutas como /login o /register.
   * Redirige a /home si ya ha iniciado sesión.
   *
   * @returns `false` si el usuario está logueado (redirección), `true` si no.
   */
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
