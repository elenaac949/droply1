import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from '../environments/environment';

/**
 * Interfaz que representa una valoración (review) asociada a una fuente de agua.
 */
export interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
  status: string;
  source_name?: string; // Usado si se obtiene junto al nombre de la fuente
}

/**
 * Interfaz para enviar una nueva valoración
 */
export interface CreateReviewRequest {
  water_source_id: string;
  rating: number;
  comment: string;
}

/**
 * Servicio para gestionar valoraciones desde el frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  /** URL base del endpoint de valoraciones */
  private apiUrl = `${environment.apiUrl}/api/reviews`;
  /** URL base del endpoint de fuentes de agua */
  private waterSourcesUrl = `${environment.apiUrl}/api/water-sources`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las valoraciones con estado 'pending' (pendientes de moderación).
   * 
   * @returns Observable con una lista de valoraciones pendientes
   */
  getPendingReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/pending`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Modera una valoración cambiando su estado a 'approved' o 'rejected'.
   * 
   * @param id ID de la valoración
   * @param status Estado nuevo ('approved' o 'rejected')
   * @returns Observable con el resultado del backend
   */
  moderateReview(id: string, status: 'approved' | 'rejected'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/moderate`, { status }).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtiene los datos básicos de una fuente de agua por su ID.
   * 
   * @param waterSourceId ID de la fuente de agua
   * @returns Observable con los datos de la fuente
   */
  getWaterSourceInfo(waterSourceId: string): Observable<any> {
    return this.http.get<any>(`${this.waterSourcesUrl}/${waterSourceId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Obtiene las valoraciones aprobadas asociadas a una fuente de agua.
   * 
   * @param waterSourceId ID de la fuente de agua
   * @returns Observable con una lista de valoraciones aprobadas
   */
  getApprovedReviewsBySource(waterSourceId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/source/${waterSourceId}`).pipe(
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Crea una nueva valoración para una fuente de agua.
   * Requiere token de autenticación.
   * 
   * @param reviewData Datos de la valoración a crear
   * @returns Observable con la respuesta del backend
   */
  createReview(reviewData: CreateReviewRequest): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Token de autenticación requerido'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(this.apiUrl, reviewData, { headers }).pipe(
      catchError(error => throwError(() => error))
    );
  }
}