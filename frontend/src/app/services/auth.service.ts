import { Injectable } from '@angular/core';
import { User } from '../models/User';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token: string | null = null;
  private userId: string | null = null;
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  
  constructor(private http: HttpClient, private router: Router) {}

  isAdmin(): boolean {
    return this.getUserId() === '2c7bcacd-3421-11f0-a782-a83b76296ff4'; 
  }


  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/auth/login', { email, password }).pipe(
      tap(response => {
        this.token = response.token;
        this.userId = response.userId;
        localStorage.setItem('token', this.token ?? '');
        localStorage.setItem('userId', this.userId ?? '');
        this.isLoggedIn$.next(true);
      })
    );
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
