import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Guard que protege rutas exclusivas para administradores.
 * Verifica el estado reactivo `isAdmin$` del AuthService.
 */
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Determina si el usuario puede activar la ruta protegida.
   * Si no es admin, redirige a `/home`.
   *
   * @returns `true` si el usuario es admin, `false` en caso contrario.
   */
  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAdmin$.pipe(
      take(1), // Tomamos el primer valor disponible y cerramos la suscripción
      map(isAdmin => {
        if (isAdmin) {
          return true;
        } else {
          this.router.navigate(['/home']);
          return false;
        }
      })
    );
  }
}
