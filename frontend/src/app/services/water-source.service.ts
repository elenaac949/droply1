import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { of } from 'rxjs';

export interface WaterSource {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'drinking' | 'tap' | 'decorative' | 'bottle_refill' | 'natural_spring' | 'other';
  is_accessible: boolean;
  schedule: string;
  username: string;
  created_at: string;
  country: string;
  city: string;
  postal_code: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  is_osm?: boolean;
  osm_id?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WaterSourceService {
  private apiUrl = 'http://localhost:3000/api/water-sources';

  constructor(private http: HttpClient) { }

  /** Obtener fuentes pendientes de moderación */
  getPendingSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/pending`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Moderar fuente (cambiar estado) */
  moderateSource(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Obtener todas las fuentes */
  getAllSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(this.apiUrl).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Obtener solo fuentes aprobadas (por ejemplo, para el mapa) */
  getApprovedSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/approved`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Eliminar una fuente concreta */
  deleteSource(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /** Actualizar una fuente existente */
  updateSource(id: string, data: Partial<WaterSource>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(
      catchError(error => throwError(() => error))
    );
  }


  /* Gestiondes de las fuentes del OSM */
  getByOSMId(osmId: number): Observable<WaterSource | null> {
    return this.http.get<WaterSource>(`${this.apiUrl}/osm/${osmId}`).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null);  
        }
        return throwError(() => error);
      })
    );
  }


  createSource(data: Partial<WaterSource>): Observable<WaterSource> {
    return this.http.post<WaterSource>(this.apiUrl, data).pipe(
      catchError(error => throwError(() => error))
    );
  }

}
