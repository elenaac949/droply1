import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

/**
 * Servicio de autenticación para gestionar login, logout,
 * y acceso a información del usuario autenticado.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;

  /** Estado reactivo de si el usuario está logueado */
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());

  /** Estado reactivo de si el usuario actual es administrador */
  public isAdmin$ = new BehaviorSubject<boolean>(false);

  /** Nombre del usuario actual (si está autenticado) */
  public username$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkStoredUserData();
  }

  /**
   * Verifica si el rol del usuario actual es 'admin'.
   * @returns true si es admin, false si no.
   */
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  /**
   * Inicia sesión enviando email y contraseña al backend.
   * Almacena los datos en localStorage y actualiza los estados reactivos.
   * 
   * @param email Correo electrónico
   * @param password Contraseña
   * @returns Observable con la respuesta del backend
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/auth/login', { email, password }).pipe(
      tap(response => {
        this.token = response.token;
        this.userId = response.userId;
        this.userRole = response.role;

        localStorage.setItem('token', this.token ?? '');
        localStorage.setItem('userId', this.userId ?? '');
        localStorage.setItem('role', this.userRole ?? '');
        localStorage.setItem('username', response.username ?? '');

        this.isLoggedIn$.next(true);
        this.isAdmin$.next(this.isAdmin());
        this.username$.next(response.username);
      })
    );
  }

  /**
   * Carga datos del usuario desde el localStorage al iniciar la app.
   */
  checkStoredUserData() {
    const storedRole = localStorage.getItem('role');
    const storedUsername = localStorage.getItem('username');

    if (storedRole) {
      this.userRole = storedRole;
      this.isAdmin$.next(this.isAdmin());
    }

    if (storedUsername) {
      this.username$.next(storedUsername);
    }
  }

  /**
   * Cierra sesión del usuario: limpia los datos en memoria y en localStorage.
   * Redirige al usuario al inicio.
   */
  logout() {
    this.token = null;
    this.userId = null;
    this.userRole = null;

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    this.isLoggedIn$.next(false);
    this.isAdmin$.next(false);
    this.username$.next(null);

    this.router.navigate(['/']);
  }

  /**
   * Obtiene el token JWT actual desde memoria o localStorage.
   * @returns Token JWT o null
   */
  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  /**
   * Obtiene el nombre de usuario desde localStorage.
   * @returns Nombre de usuario o null
   */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  /**
   * Obtiene el ID del usuario actual.
   * @returns ID del usuario o null
   */
  getUserId(): string | null {
    return this.userId || localStorage.getItem('userId');
  }

  /**
   * Devuelve si hay sesión activa (token presente).
   * @returns true si hay token
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Comprueba si hay token almacenado al iniciar la aplicación.
   * @returns true si existe un token
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Registra un nuevo usuario enviando los datos al backend.
   * @param userData Objeto con los campos del formulario de registro
   * @returns Observable con la respuesta del backend
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    country?: string;
    city?: string;
    postal_code?: string;
    address?: string;
  }) {
    return this.http.post('http://localhost:3000/auth/signup', userData);
  }
}
