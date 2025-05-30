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

  constructor(private http: HttpClient, private router: Router) {}

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }



  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/auth/login', { email, password }).pipe(
      tap(response => {
        this.token = response.token;
        this.userId = response.userId;
        this.userRole = response.role;

        /* almacenar en el localstorage */
        localStorage.setItem('token', this.token ?? '');
        localStorage.setItem('userId', this.userId ?? '');
        localStorage.setItem('role', this.userRole ?? '');

        /* actualizamos los estados reactivis */
        this.isLoggedIn$.next(true);
        this.isAdmin$.next(this.isAdmin());
      })
    );
  }

  // Al iniciar la app verificamos el rol almacenado
  checkStoredRole() {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      this.userRole = storedRole;
      this.isAdmin$.next(this.isAdmin());
    }
  }

  logout() {
    this.token = null;
    this.userId = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    this.isLoggedIn$.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
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

  register(username: string, email: string, password: string) {
  return this.http.post('http://localhost:3000/auth/signup', {
    username,
    email,
    password
  });
}


}
