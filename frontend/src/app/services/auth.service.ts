import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../environments/environments';

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

  /** URL base de la API */
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    this.checkStoredUserData();
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
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

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserId(): string | null {
    return this.userId || localStorage.getItem('userId');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

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
    return this.http.post(`${this.apiUrl}/auth/signup`, userData);
  }
}
