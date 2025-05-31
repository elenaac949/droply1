import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface WaterSource {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'drinking'|'tap'|'decorative'|'bottle_refill'|'natural_spring'|'other';
  is_accessible: boolean;
  schedule: string;
  username: string;
  created_at: string;
  country: string;
  city: string;
  postal_code: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class WaterSourceService {
  private apiUrl = 'http://localhost:3000/api/water-sources';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /* Obtener fuentes pendientes de moderación */
  getPendingSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/pending`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /* Moderar fuentes */
  moderateSource(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /* Obtener todas las fuentes (opcional) */
  getAllSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(this.apiUrl).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /* Obtener fuentes aprobadas (para mapa) */
  getApprovedSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/approved`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  
}