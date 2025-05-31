import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;

  /* Behaviours */
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  public isAdmin$ = new BehaviorSubject<boolean>(false);
  public username$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkStoredUserData();
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }



  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/auth/login', { email, password }).pipe(
      tap(response => {
        console.log('Respuesta del login:', response);
        this.token = response.token;
        this.userId = response.userId;
        this.userRole = response.role;

        /* almacenar en el localstorage */
        localStorage.setItem('token', this.token ?? '');
        localStorage.setItem('userId', this.userId ?? '');
        localStorage.setItem('role', this.userRole ?? '');
        localStorage.setItem('username', response.username ?? '');

        /* actualizamos los estados reactivos */
        this.isLoggedIn$.next(true);
        this.isAdmin$.next(this.isAdmin());
        this.username$.next(response.username); // Emitir el nuevo username
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
    return this.http.post('http://localhost:3000/auth/signup', userData);
  }



}
