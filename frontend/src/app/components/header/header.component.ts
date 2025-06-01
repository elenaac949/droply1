import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule, Router } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

/**
 * Componente del encabezado principal de la aplicación.
 * Muestra barra de navegación, nombre de usuario y opciones de sesión.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    /** Servicio de autenticación para mostrar estado y cerrar sesión */
    public authService: AuthService,
    private router: Router
  ) {}

  /**
   * Cierra la sesión actual y redirige a la página de inicio.
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
