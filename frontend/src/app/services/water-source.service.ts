import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, throwError, Observable, of, map } from 'rxjs';

/**
 * Interfaz que representa una fuente de agua.
 */
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

/**
 * Servicio para interactuar con las fuentes de agua del backend.
 */
@Injectable({
  providedIn: 'root'
})
export class WaterSourceService {
  private apiUrl = 'http://localhost:3000/api/water-sources';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las fuentes en estado 'pending' (pendientes de aprobación).
   * @returns Observable con array de fuentes pendientes
   */
  getPendingSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/pending`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Cambia el estado de una fuente a 'approved' o 'rejected'.
   * @param id ID de la fuente
   * @param status Estado nuevo
   * @returns Observable con la respuesta del backend
   */
  moderateSource(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtiene todas las fuentes registradas.
   * @returns Observable con array de fuentes
   */
  getAllSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(this.apiUrl).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtiene solo las fuentes aprobadas (útil para mostrar en el mapa).
   * @returns Observable con fuentes aprobadas
   */
  getApprovedSources(): Observable<WaterSource[]> {
    return this.http.get<WaterSource[]>(`${this.apiUrl}/approved`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Elimina una fuente por su ID.
   * @param id ID de la fuente a eliminar
   * @returns Observable con la respuesta del backend
   */
  deleteSource(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => throwError(() => error))
    );
  }


  /**
   * Actualiza los datos de una fuente existente.
   * @param id ID de la fuente
   * @param data Campos a actualizar
   * @returns Observable con la respuesta del backend
   */
  updateSource(id: string, data: Partial<WaterSource>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Busca una fuente importada de OpenStreetMap por su ID de OSM.
   * @param osmId ID del nodo de OSM
   * @returns Observable con la fuente encontrada o null si no existe
   */
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

  /**
   * Crea una nueva fuente de agua.
   * @param data Datos de la nueva fuente
   * @returns Observable con la fuente creada
   */
  createSource(data: Partial<WaterSource>): Observable<WaterSource> {
    return this.http.post<WaterSource>(this.apiUrl, data).pipe(
      catchError(error => throwError(() => error))
    );
  }


/* no funciona */
  getLastSourceByUser(token: string): Observable<WaterSource | null> {
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http
    .get<{ data: WaterSource }>('http://localhost:3000/api/water-sources/latest/by-user', {
      headers
    })
    .pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error al obtener la última fuente por usuario:', error);
        return of(null);
      })
    );
}



}
