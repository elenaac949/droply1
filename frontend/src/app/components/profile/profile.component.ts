import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule,NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone:true,
  imports: [
    CommonModule,
    NgIf,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  user: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    
    const userId = this.authService.getUserId();
    console.log('ID del usuario actual:', userId);
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData: User | null) => {
          console.log('Datos recibidos del backend:', userData);
          this.user = userData;
        },
        error: () => {
          console.error('No se pudo cargar el perfil del usuario.');
        }
      });
    }
  }

  editarPerfil() {
    // Aquí puedes abrir un modal o redirigir a un formulario
    console.log('Editar perfil');
  }

  cambiarContrasena() {
    // Abrir modal o redirigir a página de cambio de contraseña
    console.log('Cambiar contraseña');
  }

  eliminarCuenta() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) {
      this.userService.deleteUser(this.user!.id).subscribe(() => {
        this.authService.logout();
      });
    }
  }
}
