import { Component, NgModule, OnInit } from '@angular/core';
import { UserService, User } from '../../../services/user.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ NgFor, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  searchTerm: string = '';

  constructor(private userService: UserService) { }

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
    console.log('Editar usuario:', user);
    // Aquí podrías abrir un modal o redirigir a una ruta para editar
  }

  addUser() {
    console.log('Agregar nuevo usuario');
    // Aquí podrías abrir un modal o redirigir a un formulario
  }

}
