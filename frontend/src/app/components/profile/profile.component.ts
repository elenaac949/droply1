import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { ViewChild, ElementRef } from '@angular/core';

/**
 * Componente del perfil de usuario.
 * Permite ver, editar, actualizar la contraseña, y gestionar la foto de perfil.
 */
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
    MatSnackBarModule,
    MatIcon
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  /** Usuario actual cargado */
  user: User | null = null;

  /** Formulario de edición de perfil activo */
  editProfileForm = false;

  /** Copia del usuario para edición */
  userToEdit: User | null = null;

  /** Email original para validar cambios */
  originalEmail = '';

  /** Flag si el email ya existe al editar */
  emailExistsEdit = false;

  /** Formulario de cambio de contraseña visible */
  changePasswordForm = false;

  /** Datos del cambio de contraseña */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  /** Error en contraseña actual */
  passwordError = '';

  /** Flag que indica si la contraseña actual es válida */
  isCurrentPasswordValid = true;

  /** Referencia al input de archivo para imagen */
  @ViewChild('fileInput') fileInput!: ElementRef;

  /** Evento del input de imagen */
  imageChangedEvent: any = '';

  /** Imagen recortada lista para subir */
  croppedImage: any = '';

  /** Flag si se muestra el recortador de imagen */
  showImageCropper = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  /**
   * Inicializa el componente cargando los datos del usuario actual.
   * @returns void
   */
  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (userData) => this.user = userData,
        error: () => console.error('No se pudo cargar el perfil del usuario.')
      });
    }
  }

  /**
   * Habilita el modo edición del perfil.
   * @returns void
   */
  editarPerfil(): void {
    if (!this.user) return;
    this.userToEdit = { ...this.user };
    this.originalEmail = this.user.email;
    this.editProfileForm = true;
  }

  /**
   * Cierra el formulario de edición.
   * @returns void
   */
  cerrarEdicion(): void {
    this.editProfileForm = false;
    this.userToEdit = null;
  }

  /**
   * Valida si el nuevo email ya existe en la base de datos.
   * @param email - Email a comprobar
   * @returns void
   */
  validateEmailEdit(email: string): void {
    if (!email || email === this.originalEmail) {
      this.emailExistsEdit = false;
      return;
    }
    this.userService.checkEmailExists(email).subscribe({
      next: res => this.emailExistsEdit = res === true,
      error: () => this.emailExistsEdit = false
    });
  }

  /**
   * Guarda los cambios en el perfil del usuario.
   * @returns void
   */
  guardarCambiosPerfil(): void {
    if (!this.userToEdit) return;

    this.userService.updateUser(this.userToEdit).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.user = this.userToEdit as User;
        this.editProfileForm = false;
      },
      error: () => {
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Elimina la cuenta del usuario actual.
   * @returns void
   */
  eliminarCuenta(): void {
    if (!this.user?.id || !confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

    this.userService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('Cuenta eliminada correctamente', 'Cerrar', {
          duration: 3000, verticalPosition: 'top', panelClass: ['snackbar-success']
        });
        this.authService.logout();
        this.router.navigate(['/landing']);
      },
      error: () => {
        this.snackBar.open('Error al eliminar la cuenta', 'Cerrar', {
          duration: 3000, verticalPosition: 'top', panelClass: ['snackbar-error']
        });
      }
    });
  }

  /**
   * Muestra el formulario de cambio de contraseña.
   * @returns void
   */
  openChangePasswordModal(): void {
    this.changePasswordForm = true;
    this.passwordData = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
    this.isCurrentPasswordValid = true;
  }

  /**
   * Alias público para abrir el modal de contraseña.
   * @returns void
   */
  cambiarContrasena(): void {
    this.openChangePasswordModal();
  }

  /**
   * Envía los cambios de contraseña al backend.
   * @returns void
   */
  submitPasswordChange(): void {
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
        this.snackBar.open('Contraseña actualizada correctamente ', 'Cerrar', { duration: 3000 });
        this.changePasswordForm = false;
      },
      error: err => {
        const msg = err.error?.message || 'Error al cambiar la contraseña';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Verifica si la contraseña actual introducida es correcta.
   * @returns void
   */
  checkCurrentPassword(): void {
    const userId = this.user?.id;
    if (!userId || !this.passwordData.currentPassword) return;

    this.userService.verifyCurrentPassword(userId, this.passwordData.currentPassword).subscribe({
      next: isValid => this.isCurrentPasswordValid = isValid,
      error: () => this.isCurrentPasswordValid = false
    });
  }

  /**
   * Verifica si las nuevas contraseñas no coinciden.
   * @returns boolean
   */
  passwordsDoNotMatch(): boolean {
    return (
      this.passwordData.newPassword !== '' &&
      this.passwordData.confirmNewPassword !== '' &&
      this.passwordData.newPassword !== this.passwordData.confirmNewPassword
    );
  }

  /**
   * Dispara el input de archivo para subir imagen.
   * @returns void
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Procesa el archivo seleccionado para subir como imagen de perfil.
   * @param event - Evento de selección de archivo
   * @returns void
   */
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('La imagen es demasiado grande. Máximo 5MB.', 'Cerrar', { duration: 3000 });
        return;
      }

      if (!file.type.match('image.*')) {
        this.snackBar.open('Solo se permiten imágenes.', 'Cerrar', { duration: 3000 });
        return;
      }
      this.uploadImage(file);
    }
  }

  /**
   * Sube la imagen de perfil al servidor.
   * @param file - Archivo seleccionado
   * @returns void
   */
  uploadImage(file: File): void {
    if (!this.user) return;

    this.userService.uploadProfileImage(this.user.id, file).subscribe({
      next: (response) => {
        if (this.user) {
          this.user.profile_picture = response.profile_picture;
        }
        this.snackBar.open('Imagen de perfil actualizada', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al subir la imagen', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Elimina la imagen de perfil del usuario actual.
   * @returns void
   */
  removeProfilePicture(): void {
    if (!this.user) return;

    this.userService.deleteProfilePicture(this.user.id).subscribe({
      next: () => {
        this.user!.profile_picture = '';
        this.snackBar.open('Foto de perfil eliminada', 'Cerrar', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Error al eliminar la foto de perfil', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
