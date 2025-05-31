import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})


export class ProfileComponent {

  user: User | null = null;
  editProfileForm: boolean = false;
  userToEdit: User | null = null;
  originalEmail: string = '';
  emailExistsEdit: boolean = false;
  changePasswordForm: boolean = false;
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  passwordError: string = '';
  isCurrentPasswordValid: boolean = true;


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
    this.originalEmail = this.user!.email;
    this.editProfileForm = true;
  }

  validateEmailEdit(email: string): void {
    if (!email || email === this.originalEmail) {
      this.emailExistsEdit = false;
      return;
    }

    this.userService.checkEmailExists(email).subscribe({
      next: (res) => this.emailExistsEdit = res === true,
      error: () => this.emailExistsEdit = false
    });
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

  guardarCambiosPerfil() {
    if (!this.userToEdit) return;

    this.userService.updateUser(this.userToEdit).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente ', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.user = { ...(this.userToEdit as User) };

        this.editProfileForm = false;
      },
      error: () => {
        this.snackBar.open('Error al actualizar el perfil ', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      }
    });
  }


  openChangePasswordModal() {
    this.changePasswordForm = true;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  cambiarContrasena() {
  this.openChangePasswordModal();
}


  submitPasswordChange() {
  const { currentPassword, newPassword, confirmNewPassword } = this.passwordData;
  if (!currentPassword || !newPassword || newPassword.length < 7) {
    this.snackBar.open('La nueva contraseña debe tener al menos 7 caracteres', 'Cerrar', { duration: 3000 });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
    return;
  }

  const userId = this.user?.id;
  if (!userId) return;

  this.userService.changePassword(userId, currentPassword, newPassword).subscribe({
    next: () => {
      this.snackBar.open('Contraseña actualizada correctamente ✅', 'Cerrar', { duration: 3000 });
      this.changePasswordForm = false;
    },
    error: (err:any) => {
      const msg = err.error?.message || 'Error al cambiar la contraseña';
      this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
    }
  });
}

checkCurrentPassword(): void {
  const userId = this.user?.id;
  if (!userId || !this.passwordData.currentPassword) return;

  this.userService.verifyCurrentPassword(userId, this.passwordData.currentPassword)
    .subscribe({
      next: (isValid) => this.isCurrentPasswordValid = isValid,
      error: () => this.isCurrentPasswordValid = false
    });
}


}
