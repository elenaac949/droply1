// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Si usas BehaviorSubject (solución reactiva)
    return this.authService.isAdmin$.pipe(
      take(1), // Toma el último valor y completa la suscripción
      map(isAdmin => {
        if (isAdmin) {
          return true; // Permite el acceso
        } else {
          this.router.navigate(['/home']); // Redirige si no es admin
          return false;
        }
      })
    );

    // Alternativa si usas el método síncrono isAdmin()
    /* 
    if (this.authService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
    */
  }
}