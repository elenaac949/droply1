import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    FormsModule, 
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  user: User | null = null;
  editProfileForm: boolean = false;
  userToEdit: User | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

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
    this.userToEdit = { ...this.user! };
    this.editProfileForm = true;
  }

  cerrarEdicion() {
    this.editProfileForm = false;
    this.userToEdit = null;
  }


  eliminarCuenta() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) {
      this.userService.deleteUser(this.user!.id).subscribe(() => {
        this.authService.logout();
      });
    }
  }

  guardarCambios() {
    if (!this.userToEdit) return;
    this.userService.updateUser(this.userToEdit).subscribe(() => {
      this.user = { ...this.userToEdit! }; // actualizamos en pantalla
      this.cerrarEdicion();

      // Feedback opcional
      console.log('Perfil actualizado correctamente');
    });
  }

  cambiarContrasena() {
  console.log('Cambiar contraseña'); // Aquí luego puedes abrir un modal o navegar
}

}
