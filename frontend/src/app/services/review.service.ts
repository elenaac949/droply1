import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

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
 * Servicio para gestionar valoraciones desde el frontend.
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  /** URL base del endpoint de valoraciones */
  private apiUrl = 'http://localhost:3000/api/reviews';

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
}
