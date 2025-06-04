import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

/**
 * Interfaz que representa a un usuario dentro de la aplicación.
 */
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
  profileImage?: string;
}

/**
 * Servicio para gestionar usuarios desde el frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  /** URL base del endpoint de usuarios */
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los usuarios con rol 'user'.
   * @returns Observable con la lista de usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Crea un nuevo usuario.
   * @param user Objeto parcial con los datos del usuario
   * @returns Observable con la respuesta del backend
   */
  createUser(user: Partial<User>): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  /**
   * Elimina un usuario por su ID.
   * @param id ID del usuario a eliminar
   * @returns Observable con la respuesta del backend
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza los datos de un usuario.
   * @param user Objeto completo del usuario (incluye id)
   * @returns Observable con la respuesta del backend
   */
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }

  /**
   * Comprueba si un email ya está registrado.
   * @param email Email a comprobar
   * @returns Observable con true si existe, false si no
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?email=${encodeURIComponent(email)}`);
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario
   * @returns Observable con los datos del usuario
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambia la contraseña del usuario.
   * @param userId ID del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Observable con la respuesta del backend
   */
  changePassword(userId: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Verifica si la contraseña actual introducida es válida.
   * @param userId ID del usuario
   * @param password Contraseña actual
   * @returns Observable con true si es válida, false si no
   */
  verifyCurrentPassword(userId: string, password: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/verify-password/${userId}`, {
      currentPassword: password
    }).pipe(map(res => res.valid));
  }


  uploadProfileImage(userId: string, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile); 

    // Add debug logging
    console.log('Uploading file:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    return this.http.put(`${this.apiUrl}/${userId}/profile-picture`, formData, {
      headers: {
        // 'Content-Type' is set automatically by FormData
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).pipe(
      tap(response => console.log('Upload success:', response)),
      catchError(error => {
        console.error('Upload error:', error);
        return throwError(error);
      })
    );
  }


}

