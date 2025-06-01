import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/user.service';
import { NgIf, NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

/**
 * Componente de gestión de usuarios (admin).
 * 
 * Permite visualizar, buscar, crear, editar y eliminar usuarios.
 * Se conecta con `UserService` y muestra notificaciones con `MatSnackBar`.
 */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  /** Lista completa de usuarios */
  users: User[] = [];

  /** Término de búsqueda para filtrar usuarios */
  searchTerm: string = '';

  /** Controla la visibilidad del formulario de creación */
  addUserForm: boolean = false;

  /** Controla la visibilidad del formulario de edición */
  editUserForm: boolean = false;

  /** Usuario en proceso de edición */
  userToEdit: User | null = null;

  /** Flag para validación de email en nuevo usuario */
  emailExists: boolean = false;

  /** Email original del usuario en edición */
  originalEmail: string = '';

  /** Flag para validación de email en usuario editado */
  emailExistsEdit: boolean = false;

  /** Datos del nuevo usuario a registrar */
  newUser: Partial<User> = {
    username: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    city: '',
    postal_code: '',
    address: ''
  };

  constructor(private userService: UserService, private snackBar: MatSnackBar) {}

  /**
   * Carga los usuarios al inicializar el componente.
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Obtiene todos los usuarios del backend.
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  /**
   * Devuelve los usuarios filtrados por el término de búsqueda.
   */
  get filteredUsers(): User[] {
    const term = this.searchTerm.toLowerCase();

    return this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone || '').toLowerCase().includes(term) ||
      (user.country || '').toLowerCase().includes(term) ||
      (user.city || '').toLowerCase().includes(term) ||
      (user.postal_code || '').toLowerCase().includes(term) ||
      (user.address || '').toLowerCase().includes(term) ||
      (user.role || '').toLowerCase().includes(term)
    );
  }

  /**
   * Elimina un usuario tras confirmación.
   * @param id ID del usuario
   */
  deleteUser(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);
        this.snackBar.open('Usuario eliminado correctamente ', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      });
    }
  }

  /**
   * Activa el formulario de edición para el usuario seleccionado.
   * @param user Usuario a editar
   */
  editUser(user: User): void {
    this.userToEdit = { ...user };
    this.originalEmail = user.email;
    this.editUserForm = true;
  }

  /**
   * Envía la actualización del usuario editado.
   */
  submitEditUser(): void {
    if (!this.userToEdit) return;

    this.userService.updateUser(this.userToEdit).subscribe(() => {
      this.loadUsers();
      this.editUserForm = false;
      this.userToEdit = null;

      this.snackBar.open('Usuario editado correctamente ✏️', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    });
  }

  /**
   * Muestra el formulario para añadir un nuevo usuario.
   */
  addUser(): void {
    this.addUserForm = true;
  }

  /**
   * Cierra el formulario de creación de usuario y limpia los campos.
   */
  closeAddUser(): void {
    this.addUserForm = false;
    this.newUser = {
      username: '',
      email: '',
      password: ''
    };
  }

  /**
   * Envía los datos para crear un nuevo usuario.
   */
  submitNewUser(): void {
    this.userService.createUser(this.newUser).subscribe(() => {
      this.loadUsers();
      this.closeAddUser();

      this.snackBar.open('Usuario añadido correctamente ✅', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    });
  }

  /**
   * Comprueba si el email ingresado ya existe al añadir usuario.
   * @param email Email a validar
   */
  validateEmailUniqueness(email: string): void {
    if (!email) {
      this.emailExists = false;
      return;
    }

    this.userService.checkEmailExists(email).subscribe({
      next: (response: any) => {
        this.emailExists = response.exists;
      },
      error: () => {
        this.emailExists = false;
      }
    });
  }

  /**
   * Comprueba si el nuevo email del usuario editado ya existe.
   * @param email Email a validar
   */
  validateEmailEdit(email: string): void {
    if (!email || email === this.originalEmail) {
      this.emailExistsEdit = false;
      return;
    }

    this.userService.checkEmailExists(email).subscribe({
      next: (response: any) => {
        this.emailExistsEdit = response.exists;
      },
      error: () => {
        this.emailExistsEdit = false;
      }
    });
  }
}
