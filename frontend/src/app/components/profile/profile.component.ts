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
 * Componente del perfil de usuario. Permite ver, editar y eliminar los datos del usuario,
 * así como cambiar su contraseña.
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

  /** Controla si se está mostrando el formulario de edición */
  editProfileForm = false;

  /** Copia editable del usuario actual */
  userToEdit: User | null = null;

  /** Email original para comparación */
  originalEmail = '';

  /** Flag si el email editado ya existe */
  emailExistsEdit = false;

  /** Controla si se muestra el formulario para cambiar la contraseña */
  changePasswordForm = false;

  /** Datos del formulario de cambio de contraseña */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  /** Error si la contraseña actual no es válida */
  passwordError = '';

  /** Flag que indica si la contraseña actual es válida */
  isCurrentPasswordValid = true;


  @ViewChild('fileInput') fileInput!: ElementRef;
  // Variables para el manejo de imágenes
  imageChangedEvent: any = '';
  croppedImage: any = '';
  showImageCropper = false;


  constructor(
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  /**
   * Carga los datos del usuario al iniciar el componente.
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
   * Abre el formulario para editar el perfil.
   */
  editarPerfil(): void {
    this.userToEdit = { ...this.user! };
    this.originalEmail = this.user!.email;
    this.editProfileForm = true;
  }

  /**
   * Cierra el formulario de edición del perfil.
   */
  cerrarEdicion(): void {
    this.editProfileForm = false;
    this.userToEdit = null;
  }

  /**
   * Verifica si el nuevo email ya existe.
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
   * Guarda los cambios del perfil.
   */
  guardarCambiosPerfil(): void {
    if (!this.userToEdit) return;

    this.userService.updateUser(this.userToEdit).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente ', 'Cerrar', {
          duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
        });
        this.user = { ...this.userToEdit! };
        this.editProfileForm = false;
      },
      error: () => {
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
          duration: 3000, horizontalPosition: 'right', verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * Elimina la cuenta del usuario actual.
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
   * Abre el formulario de cambio de contraseña y reinicia los datos.
   */
  openChangePasswordModal(): void {
    this.changePasswordForm = true;
    this.passwordData = { currentPassword: '', newPassword: '', confirmNewPassword: '' };
    this.isCurrentPasswordValid = true;
  }

  /**
   * Alias público para abrir el formulario de cambio de contraseña.
   */
  cambiarContrasena(): void {
    this.openChangePasswordModal();
  }

  /**
   * Envía el formulario de cambio de contraseña si todo es válido.
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
   * Verifica si la contraseña actual introducida es válida (antes de cambiarla).
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
   * Comprueba si las nuevas contraseñas introducidas no coinciden.
   */
  passwordsDoNotMatch(): boolean {
    return (
      this.passwordData.newPassword !== '' &&
      this.passwordData.confirmNewPassword !== '' &&
      this.passwordData.newPassword !== this.passwordData.confirmNewPassword
    );
  }

  // Método para abrir el selector de archivos
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }


  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Verificar el tamaño del archivo (ejemplo: máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('La imagen es demasiado grande. Máximo 5MB.', 'Cerrar', { duration: 3000 });
        return;
      }

      // Verificar el tipo de archivo
      if (!file.type.match('image.*')) {
        this.snackBar.open('Solo se permiten imágenes.', 'Cerrar', { duration: 3000 });
        return;
      }

      // Opción 1: Subir directamente sin recortar
      this.uploadImage(file);

      // Opción 2: Mostrar recortador de imagen (requiere ngx-image-cropper)
      // this.imageChangedEvent = event;
      // this.showImageCropper = true;
    }
  }

  // Método para subir la imagen al servidor
  uploadImage(file: File): void {
    if (!this.user) return;

    this.userService.uploadProfileImage(this.user.id, file).subscribe({
      next: (response) => {
        if (this.user) {
          this.user.profileImage = response.imageUrl;
          this.snackBar.open('Imagen de perfil actualizada', 'Cerrar', { duration: 3000 });
        }
      },
      error: (err) => {
        this.snackBar.open('Error al subir la imagen', 'Cerrar', { duration: 3000 });
        console.error(err);
      }
    });
  }

  
}


