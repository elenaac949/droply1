import { Component, NgModule, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/user.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';


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
    MatIconModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  searchTerm: string = '';
  addUserForm: boolean = false;

  editUserForm: boolean = false;
  userToEdit: User | null = null;

  newUser = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private userService: UserService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  get filteredUsers() {
    return this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => user.id !== id);
      });
    }
  }

  editUser(user: User) {
    this.userToEdit = { ...user }; /* copiamos los datos del usuario */
    this.editUserForm = true;
  }

  submitEditUser() {
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

  

  addUser() {
    this.addUserForm = true;
  }

  closeAddUser() {
    this.addUserForm = false;
    this.newUser = {
      username: '',
      email: '',
      password: ''
    };
  }

  submitNewUser() {
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

}


