import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  phone?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  /** Obtener todos los usuarios */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /** Crear un nuevo usuario */
  createUser(user: Partial<User>): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  /** Eliminar usuario por ID */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /** Actualizar datos de usuario */
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  /** Verificar si un email ya existe */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?email=${encodeURIComponent(email)}`);
  }

  /** Obtener un usuario por su ID */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /** Cambiar la contraseña del usuario */
  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  /** Verificar si la contraseña actual introducida es válida */
  verifyCurrentPassword(userId: string, password: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/verify-password/${userId}`, {
      currentPassword: password
    }).pipe(map(res => res.valid));
  }
}
