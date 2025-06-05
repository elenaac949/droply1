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
 * @component UserManagementComponent
 * 
 * Componente de administración de usuarios para el panel de control de la aplicación.
 * Permite listar, filtrar, crear, editar y eliminar usuarios.
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

  /** Lista completa de usuarios obtenida desde el backend */
  users: User[] = [];

  /** Texto para búsqueda de usuarios */
  searchTerm: string = '';

  /** Indica si se muestra el formulario de creación */
  addUserForm: boolean = false;

  /** Indica si se muestra el formulario de edición */
  editUserForm: boolean = false;

  /** Usuario actualmente seleccionado para edición */
  userToEdit: User | null = null;

  /** Indica si el email del nuevo usuario ya existe */
  emailExists: boolean = false;

  /** Email original del usuario que se está editando */
  originalEmail: string = '';

  /** Indica si el email editado ya existe */
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

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Hook de inicialización del componente.
   * Carga todos los usuarios al iniciar el componente.
   * 
   * @returns {void}
   */
  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Obtiene la lista de usuarios desde el backend.
   * 
   * @returns {void}
   */
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  /**
   * Devuelve la lista de usuarios filtrados por el término de búsqueda actual.
   * 
   * @returns {User[]} Lista de usuarios que coinciden con el término de búsqueda.
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
   * Elimina un usuario del sistema tras confirmación.
   * 
   * @param {string} id - ID del usuario a eliminar.
   * @returns {void}
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
   * 
   * @param {User} user - Usuario a editar.
   * @returns {void}
   */
  editUser(user: User): void {
    this.userToEdit = { ...user };
    this.originalEmail = user.email;
    this.editUserForm = true;
  }

  /**
   * Envía los datos del usuario editado al backend.
   * 
   * @returns {void}
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
   * Muestra el formulario para crear un nuevo usuario.
   * 
   * @returns {void}
   */
  addUser(): void {
    this.addUserForm = true;
  }

  /**
   * Cierra el formulario de creación de usuario y reinicia el estado del nuevo usuario.
   * 
   * @returns {void}
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
   * Envía los datos del nuevo usuario al backend para su creación.
   * 
   * @returns {void}
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
   * Valida si el email ya existe al registrar un nuevo usuario.
   * 
   * @param {string} email - Email a comprobar.
   * @returns {void}
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
   * Valida si el nuevo email ingresado durante la edición ya existe.
   * 
   * @param {string} email - Nuevo email a comprobar.
   * @returns {void}
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
